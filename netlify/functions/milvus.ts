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

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
}

// Get Milvus configuration from environment variables (server-side only)
function getMilvusConfig(): MilvusConfig {
  const endpoint = process.env.MILVUS_ENDPOINT;
  const token = process.env.MILVUS_TOKEN;

  if (!endpoint || !token) {
    throw new MilvusError(
      'Milvus configuration missing. Please set MILVUS_ENDPOINT and MILVUS_TOKEN environment variables.',
      'CONFIG_ERROR'
    );
  }

  return {
    endpoint,
    token
  };
}

/**
 * Milvus/Zilliz integration service (server-side)
 */
class MilvusService {
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
          plan: 'Starter',
          cu: 1
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

export default async function handler(request: Request) {
  console.log('Milvus function called:', request.method, request.url);

  // Handle CORS preflight
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    // Get Milvus configuration
    const config = getMilvusConfig();
    const milvusService = new MilvusService(config);

    const url = new URL(request.url);
    const action = url.searchParams.get('action');

    if (request.method === 'POST') {
      const body = await request.json();

      switch (action) {
        case 'create_cluster': {
          const { clusterName } = body;
          const clusterId = await milvusService.createCluster(clusterName);
          return new Response(JSON.stringify({ clusterId }), {
            status: 200,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }

        case 'create_collection': {
          const { clusterId, schema } = body;
          await milvusService.createCollection(clusterId, schema);
          return new Response(JSON.stringify({ success: true }), {
            status: 200,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }

        case 'insert_vectors': {
          const { clusterId, collectionName, vectors } = body;
          await milvusService.insertVectors(clusterId, collectionName, vectors);
          return new Response(JSON.stringify({ success: true }), {
            status: 200,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }

        case 'search_vectors': {
          const { clusterId, collectionName, queryVector, topK, filter } = body;
          const results = await milvusService.searchVectors(clusterId, collectionName, queryVector, topK, filter);
          return new Response(JSON.stringify({ results }), {
            status: 200,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }

        case 'delete_collection': {
          const { clusterId, collectionName } = body;
          await milvusService.deleteCollection(clusterId, collectionName);
          return new Response(JSON.stringify({ success: true }), {
            status: 200,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }

        default:
          return new Response(JSON.stringify({ error: 'Invalid action' }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
      }
    }

    if (request.method === 'GET') {
      switch (action) {
        case 'cluster_status': {
          const clusterId = url.searchParams.get('clusterId');
          if (!clusterId) {
            return new Response(JSON.stringify({ error: 'Missing clusterId parameter' }), {
              status: 400,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
          }
          const status = await milvusService.getClusterStatus(clusterId);
          return new Response(JSON.stringify({ status }), {
            status: 200,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }

        default:
          return new Response(JSON.stringify({ error: 'Invalid action' }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
      }
    }

    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Milvus function error:', error);
    
    if (error instanceof MilvusError) {
      return new Response(JSON.stringify({
        error: error.message,
        code: error.code,
        details: error.details
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
}