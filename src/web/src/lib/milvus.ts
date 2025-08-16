// Milvus/Zilliz configuration
interface MilvusConfig {
  endpoint: string;
  token: string;
  clusterId?: string;
}

// Collection schema for vector embeddings
interface CollectionSchema {
  name: string;
  description?: string;
  dimension: number;
  metricType: 'L2' | 'IP' | 'COSINE';
  indexType: 'IVF_FLAT' | 'IVF_SQ8' | 'IVF_PQ' | 'HNSW' | 'SCANN';
}

// Vector data structure
interface VectorData {
  id: string;
  vector: number[];
  metadata?: Record<string, any>;
}

// Search result structure
interface SearchResult {
  id: string;
  score: number;
  metadata?: Record<string, any>;
}

// Error types for Milvus operations
class MilvusError extends Error {
  constructor(message: string, public code?: string, public details?: any) {
    super(message);
    this.name = 'MilvusError';
  }
}

/**
 * Milvus/Zilliz integration service (client-side)
 * Makes secure calls to backend API instead of direct Milvus API calls
 */
export class MilvusService {
  private apiBaseUrl: string;

  constructor() {
    // Use Netlify functions endpoint instead of direct Milvus API
    this.apiBaseUrl = '/.netlify/functions/milvus';
  }

  /**
   * Create a new cluster for a workspace
   */
  async createCluster(clusterName: string): Promise<string> {
    try {
      const response = await fetch(`${this.apiBaseUrl}?action=create_cluster`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          clusterName
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new MilvusError(
          `Failed to create cluster: ${error.error || response.statusText}`,
          error.code,
          error
        );
      }

      const result = await response.json();
      return result.clusterId;
    } catch (error) {
      if (error instanceof MilvusError) {
        throw error;
      }
      throw new MilvusError(
        `Network error creating cluster: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'NETWORK_ERROR'
      );
    }
  }

  /**
   * Create a new collection in a cluster
   */
  async createCollection(
    clusterId: string,
    schema: CollectionSchema
  ): Promise<void> {
    try {
      const response = await fetch(`${this.apiBaseUrl}?action=create_collection`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          clusterId,
          collectionName: schema.name,
          description: schema.description,
          schema: {
            fields: [
              {
                fieldName: 'id',
                dataType: 'VarChar',
                isPrimary: true,
                elementTypeParams: {
                  max_length: 255
                }
              },
              {
                fieldName: 'vector',
                dataType: 'FloatVector',
                elementTypeParams: {
                  dim: schema.dimension
                }
              },
              {
                fieldName: 'metadata',
                dataType: 'JSON'
              }
            ]
          },
          indexParams: [
            {
              fieldName: 'vector',
              indexName: 'vector_index',
              indexConfig: {
                index_type: schema.indexType,
                metric_type: schema.metricType,
                params: {
                  nlist: 1024
                }
              }
            }
          ]
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new MilvusError(
          `Failed to create collection: ${error.error || response.statusText}`,
          error.code,
          error
        );
      }
    } catch (error) {
      if (error instanceof MilvusError) {
        throw error;
      }
      throw new MilvusError(
        `Network error creating collection: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'NETWORK_ERROR'
      );
    }
  }

  /**
   * Insert vectors into a collection
   */
  async insertVectors(
    clusterId: string,
    collectionName: string,
    vectors: VectorData[]
  ): Promise<void> {
    try {
      const response = await fetch(`${this.apiBaseUrl}?action=insert_vectors`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          clusterId,
          collectionName,
          data: vectors.map(v => ({
            id: v.id,
            vector: v.vector,
            metadata: v.metadata || {}
          }))
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new MilvusError(
          `Failed to insert vectors: ${error.error || response.statusText}`,
          error.code,
          error
        );
      }
    } catch (error) {
      if (error instanceof MilvusError) {
        throw error;
      }
      throw new MilvusError(
        `Network error inserting vectors: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'NETWORK_ERROR'
      );
    }
  }

  /**
   * Search for similar vectors
   */
  async searchVectors(
    clusterId: string,
    collectionName: string,
    queryVector: number[],
    limit: number = 10,
    filter?: string
  ): Promise<SearchResult[]> {
    try {
      const response = await fetch(`${this.apiBaseUrl}?action=search_vectors`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          clusterId,
          collectionName,
          vector: queryVector,
          limit,
          filter
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new MilvusError(
          `Failed to search vectors: ${error.error || response.statusText}`,
          error.code,
          error
        );
      }

      const result = await response.json();
      return result.data || [];
    } catch (error) {
      if (error instanceof MilvusError) {
        throw error;
      }
      throw new MilvusError(
        `Network error searching vectors: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'NETWORK_ERROR'
      );
    }
  }

  /**
   * Delete a collection
   */
  async deleteCollection(clusterId: string, collectionName: string): Promise<void> {
    try {
      const response = await fetch(`${this.apiBaseUrl}?action=delete_collection`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          clusterId,
          collectionName
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new MilvusError(
          `Failed to delete collection: ${error.error || response.statusText}`,
          error.code,
          error
        );
      }
    } catch (error) {
      if (error instanceof MilvusError) {
        throw error;
      }
      throw new MilvusError(
        `Network error deleting collection: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'NETWORK_ERROR'
      );
    }
  }

  /**
   * Get cluster status
   */
  async getClusterStatus(clusterId: string): Promise<any> {
    try {
      const response = await fetch(`${this.apiBaseUrl}?action=cluster_status&clusterId=${clusterId}`, {
        method: 'GET'
      });

      if (!response.ok) {
        const error = await response.json();
        throw new MilvusError(
          `Failed to get cluster status: ${error.error || response.statusText}`,
          error.code,
          error
        );
      }

      return await response.json();
    } catch (error) {
      if (error instanceof MilvusError) {
        throw error;
      }
      throw new MilvusError(
        `Network error getting cluster status: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'NETWORK_ERROR'
      );
    }
  }
}

/**
 * Get Milvus configuration from environment variables (client-side - no token)
 */
export function getMilvusConfig(): MilvusConfig {
  // Only endpoint is needed on client-side for display purposes
  // Token is handled securely on the server-side
  const endpoint = import.meta.env.VITE_MILVUS_ENDPOINT || 'https://api.milvus.io';

  return {
    endpoint,
    token: '' // Token is not exposed to client-side
  };
}

/**
 * Create a Milvus service instance
 */
export function createMilvusService(): MilvusService {
  return new MilvusService();
}

/**
 * Create a Milvus service instance with environment configuration
 */
export function createMilvusServiceFromEnv(): MilvusService {
  return new MilvusService();
}

/**
 * Default collection schemas for common use cases
 */
export const defaultSchemas = {
  textEmbeddings: {
    name: 'text_embeddings',
    description: 'Text embeddings collection',
    dimension: 1536, // OpenAI text-embedding-ada-002 dimension
    metricType: 'COSINE' as const,
    indexType: 'HNSW' as const
  },
  imageEmbeddings: {
    name: 'image_embeddings',
    description: 'Image embeddings collection',
    dimension: 512, // Common image embedding dimension
    metricType: 'L2' as const,
    indexType: 'IVF_FLAT' as const
  }
};

export {
  MilvusError,
  type MilvusConfig,
  type CollectionSchema,
  type VectorData,
  type SearchResult
};
