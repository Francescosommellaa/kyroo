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
 * Milvus/Zilliz integration service
 * Handles cluster creation, collection management, and vector operations
 */
export class MilvusService {
  private config: MilvusConfig;
  private baseUrl: string;

  constructor(config: MilvusConfig) {
    this.config = config;
    this.baseUrl = config.endpoint.replace(/\/$/, '');
  }

  /**
   * Create a new cluster for a workspace
   */
  async createCluster(clusterName: string): Promise<string> {
    try {
      const response = await fetch(`${this.baseUrl}/v1/clusters`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.config.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          clusterName,
          plan: 'Starter', // Default plan
          cu: 1 // Compute units
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new MilvusError(
          `Failed to create cluster: ${error.message || response.statusText}`,
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
      const response = await fetch(`${this.baseUrl}/v1/vector/collections`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.config.token}`,
          'Content-Type': 'application/json',
          'cluster-id': clusterId
        },
        body: JSON.stringify({
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
          `Failed to create collection: ${error.message || response.statusText}`,
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
      const response = await fetch(`${this.baseUrl}/v1/vector/insert`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.config.token}`,
          'Content-Type': 'application/json',
          'cluster-id': clusterId
        },
        body: JSON.stringify({
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
          `Failed to insert vectors: ${error.message || response.statusText}`,
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
    topK: number = 10,
    filter?: string
  ): Promise<SearchResult[]> {
    try {
      const response = await fetch(`${this.baseUrl}/v1/vector/search`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.config.token}`,
          'Content-Type': 'application/json',
          'cluster-id': clusterId
        },
        body: JSON.stringify({
          collectionName,
          vector: queryVector,
          limit: topK,
          filter: filter || '',
          outputFields: ['id', 'metadata']
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new MilvusError(
          `Failed to search vectors: ${error.message || response.statusText}`,
          error.code,
          error
        );
      }

      const result = await response.json();
      return result.data.map((item: any) => ({
        id: item.id,
        score: item.distance,
        metadata: item.metadata
      }));
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
      const response = await fetch(`${this.baseUrl}/v1/vector/collections/${collectionName}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${this.config.token}`,
          'cluster-id': clusterId
        }
      });

      if (!response.ok) {
        const error = await response.json();
        throw new MilvusError(
          `Failed to delete collection: ${error.message || response.statusText}`,
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
  async getClusterStatus(clusterId: string): Promise<string> {
    try {
      const response = await fetch(`${this.baseUrl}/v1/clusters/${clusterId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.config.token}`
        }
      });

      if (!response.ok) {
        const error = await response.json();
        throw new MilvusError(
          `Failed to get cluster status: ${error.message || response.statusText}`,
          error.code,
          error
        );
      }

      const result = await response.json();
      return result.status;
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
 * Get Milvus configuration from environment variables
 */
export function getMilvusConfig(): MilvusConfig {
  const endpoint = import.meta.env.VITE_MILVUS_ENDPOINT;
  const token = import.meta.env.VITE_MILVUS_TOKEN;

  if (!endpoint || !token) {
    throw new MilvusError(
      'Milvus configuration missing. Please set VITE_MILVUS_ENDPOINT and VITE_MILVUS_TOKEN environment variables.',
      'CONFIG_ERROR'
    );
  }

  return {
    endpoint,
    token
  };
}

/**
 * Create a Milvus service instance
 */
export function createMilvusService(config: MilvusConfig): MilvusService {
  return new MilvusService(config);
}

/**
 * Create a Milvus service instance with environment configuration
 */
export function createMilvusServiceFromEnv(): MilvusService {
  const config = getMilvusConfig();
  return new MilvusService(config);
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
