import { supabase } from './supabase';
import { Database } from './database.types';
import { MilvusService, createMilvusService, MilvusConfig, defaultSchemas } from './milvus';

type Workspace = Database['public']['Tables']['workspaces']['Row'];
type Collection = Database['public']['Tables']['collections']['Row'];

interface CreateWorkspaceOptions {
  name: string;
  description?: string;
  userId: string;
  milvusConfig?: MilvusConfig;
  createDefaultCollections?: boolean;
}

interface WorkspaceWithCollections extends Workspace {
  collections: Collection[];
  userRole?: string;
}

/**
 * Service for managing workspaces with integrated Milvus support
 */
export class WorkspaceService {
  private milvusService?: MilvusService;

  constructor() {
    this.milvusService = createMilvusService();
  }

  /**
   * Create a new workspace with optional Milvus cluster
   */
  async createWorkspace(options: CreateWorkspaceOptions): Promise<Workspace> {
    const { name, description, userId, milvusConfig, createDefaultCollections = true } = options;

    try {
      // Start a Supabase transaction
      const { data: workspace, error: workspaceError } = await supabase
        .from('workspaces')
        .insert({
          name,
          description: description || null,
          owner_id: userId,
          milvus_collection_name: `workspace-${Date.now()}`, // Default collection name
          milvus_collection_id: null, // Will be updated after cluster creation
          settings: {
            defaultCollections: createDefaultCollections,
            createdAt: new Date().toISOString()
          },
          is_active: true
        })
        .select()
        .single();

      if (workspaceError) {
        throw new Error(`Failed to create workspace: ${workspaceError.message}`);
      }

      // Add user as owner of the workspace
      const { error: userWorkspaceError } = await supabase
        .from('user_workspaces')
        .insert({
          user_id: userId,
          workspace_id: workspace.id,
          role: 'owner',
          permissions: ['read', 'write', 'admin']
        });

      if (userWorkspaceError) {
        // Rollback workspace creation
        await supabase.from('workspaces').delete().eq('id', workspace.id);
        throw new Error(`Failed to assign workspace ownership: ${userWorkspaceError.message}`);
      }

      // Create Milvus cluster if config is provided
      let clusterId: string | null = null;
      if (this.milvusService && milvusConfig) {
        try {
          clusterId = await this.milvusService.createCluster(
            `workspace-${workspace.id}`
          );

          // Update workspace with cluster ID
          const { error: updateError } = await supabase
            .from('workspaces')
            .update({ milvus_collection_id: clusterId })
            .eq('id', workspace.id);

          if (updateError) {
            console.error('Failed to update workspace with cluster ID:', updateError);
          }
        } catch (milvusError) {
          console.error('Failed to create Milvus cluster:', milvusError);
          // Don't fail workspace creation if Milvus fails
        }
      }

      // Create default collections if requested
      if (createDefaultCollections && clusterId) {
        await this.createDefaultCollections(workspace.id);
      }

      return {
        ...workspace,
        milvus_collection_id: clusterId
      };
    } catch (error) {
      throw new Error(`Workspace creation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get user's workspaces with their collections
   */
  async getUserWorkspaces(userId: string): Promise<WorkspaceWithCollections[]> {
    try {
      const { data, error } = await supabase
        .from('user_workspaces')
        .select(`
          role,
          permissions,
          workspaces (
            id,
            name,
            description,
            owner_id,
            milvus_collection_name,
            milvus_collection_id,
            settings,
            is_active,
            created_at,
            updated_at,
            collections (
              id,
              name,
              description,
              milvus_collection_name,
              schema,
              status,
              created_at,
              updated_at
            )
          )
        `)
        .eq('user_id', userId);

      if (error) {
        throw new Error(`Failed to fetch user workspaces: ${error.message}`);
      }

      return data.map(item => ({
        ...(item.workspaces as any),
        collections: (item.workspaces as any).collections || [],
        userRole: item.role
      })) as WorkspaceWithCollections[];
    } catch (error) {
      throw new Error(`Failed to get user workspaces: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get a specific workspace with collections
   */
  async getWorkspace(workspaceId: string, userId: string): Promise<WorkspaceWithCollections | null> {
    try {
      const { data, error } = await supabase
        .from('user_workspaces')
        .select(`
          role,
          permissions,
          workspaces (
            id,
            name,
            description,
            owner_id,
            milvus_collection_name,
            milvus_collection_id,
            settings,
            is_active,
            created_at,
            updated_at,
            collections (
              id,
              name,
              description,
              milvus_collection_name,
              schema,
              status,
              created_at,
              updated_at
            )
          )
        `)
        .eq('user_id', userId)
        .eq('workspace_id', workspaceId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null; // No access to workspace
        }
        throw new Error(`Failed to fetch workspace: ${error.message}`);
      }

      return {
        ...(data.workspaces as any),
        collections: (data.workspaces as any).collections || [],
        userRole: data.role
      } as WorkspaceWithCollections;
    } catch (error) {
      throw new Error(`Failed to get workspace: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Create a collection in a workspace
   */
  async createCollection(
    workspaceId: string,
    name: string,
    description?: string,
    schema?: any
  ): Promise<Collection> {
    try {
      // Get workspace to check if it has a Milvus cluster
      const { data: workspace, error: workspaceError } = await supabase
        .from('workspaces')
        .select('milvus_collection_id')
        .eq('id', workspaceId)
        .single();

      if (workspaceError) {
        throw new Error(`Failed to get workspace: ${workspaceError.message}`);
      }

      let milvusCollectionName: string | null = null;
      let collectionStatus = 'pending';

      // Create collection in Milvus if cluster exists
      if (workspace.milvus_collection_id && this.milvusService) {
        try {
          const collectionSchema = schema || defaultSchemas.textEmbeddings;
          milvusCollectionName = `${name.toLowerCase().replace(/[^a-z0-9]/g, '_')}_${Date.now()}`;
          
          await this.milvusService.createCollection(workspace.milvus_collection_id, {
            ...collectionSchema,
            name: milvusCollectionName,
            description
          });
          
          collectionStatus = 'active';
        } catch (milvusError) {
          console.error('Failed to create Milvus collection:', milvusError);
          collectionStatus = 'error';
        }
      }

      // Create collection record in database
      const { data: collection, error: collectionError } = await supabase
        .from('collections')
        .insert({
          workspace_id: workspaceId,
          name,
          description: description || null,
          milvus_collection_name: milvusCollectionName,
          schema: schema || defaultSchemas.textEmbeddings,
          status: collectionStatus
        })
        .select()
        .single();

      if (collectionError) {
        throw new Error(`Failed to create collection: ${collectionError.message}`);
      }

      return collection;
    } catch (error) {
      throw new Error(`Collection creation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Delete a workspace and its Milvus cluster
   */
  async deleteWorkspace(workspaceId: string, userId: string): Promise<void> {
    try {
      // Check if user has permission to delete
      const { data: userWorkspace, error: permissionError } = await supabase
        .from('user_workspaces')
        .select('role')
        .eq('user_id', userId)
        .eq('workspace_id', workspaceId)
        .single();

      if (permissionError || userWorkspace.role !== 'owner') {
        throw new Error('Insufficient permissions to delete workspace');
      }

      // Get workspace details
      const { data: workspace, error: workspaceError } = await supabase
        .from('workspaces')
        .select('milvus_cluster_id')
        .eq('id', workspaceId)
        .single();

      if (workspaceError) {
        throw new Error(`Failed to get workspace: ${workspaceError.message}`);
      }

      // Delete collections from Milvus
      if (workspace.milvus_cluster_id && this.milvusService) {
        const { data: collections } = await supabase
          .from('collections')
          .select('milvus_collection_name')
          .eq('workspace_id', workspaceId);

        if (collections) {
          for (const collection of collections) {
            if (collection.milvus_collection_name) {
              try {
                await this.milvusService.deleteCollection(
                  workspace.milvus_cluster_id,
                  collection.milvus_collection_name
                );
              } catch (error) {
                console.error('Failed to delete Milvus collection:', error);
              }
            }
          }
        }
      }

      // Delete workspace (cascades to collections and user_workspaces)
      const { error: deleteError } = await supabase
        .from('workspaces')
        .delete()
        .eq('id', workspaceId);

      if (deleteError) {
        throw new Error(`Failed to delete workspace: ${deleteError.message}`);
      }
    } catch (error) {
      throw new Error(`Workspace deletion failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Create default collections for a workspace
   */
  private async createDefaultCollections(workspaceId: string): Promise<void> {
    const defaultCollections = [
      {
        name: 'Text Embeddings',
        description: 'Default collection for text embeddings',
        schema: defaultSchemas.textEmbeddings
      },
      {
        name: 'Image Embeddings',
        description: 'Default collection for image embeddings',
        schema: defaultSchemas.imageEmbeddings
      }
    ];

    for (const collectionConfig of defaultCollections) {
      try {
        await this.createCollection(
          workspaceId,
          collectionConfig.name,
          collectionConfig.description,
          collectionConfig.schema
        );
      } catch (error) {
        console.error(`Failed to create default collection ${collectionConfig.name}:`, error);
      }
    }
  }
}

/**
 * Create a workspace service instance
 */
export function createWorkspaceService(): WorkspaceService {
  return new WorkspaceService();
}

export type { CreateWorkspaceOptions, WorkspaceWithCollections };