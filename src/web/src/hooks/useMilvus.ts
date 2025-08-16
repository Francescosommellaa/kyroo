import { useState, useCallback } from 'react';
import { 
  MilvusService, 
  createMilvusService, 
  CollectionSchema, 
  VectorData, 
  SearchResult,
  MilvusError,
  defaultSchemas
} from '../lib/milvus';
import { useAsync } from './useAsync';

interface UseMilvusOptions {
  onError?: (error: MilvusError) => void;
}

interface MilvusOperations {
  // Cluster operations
  createCluster: (workspaceId: string, clusterName: string) => Promise<string>;
  getClusterStatus: (clusterId: string) => Promise<string>;
  
  // Collection operations
  createCollection: (clusterId: string, schema: CollectionSchema) => Promise<void>;
  deleteCollection: (clusterId: string, collectionName: string) => Promise<void>;
  
  // Vector operations
  insertVectors: (clusterId: string, collectionName: string, vectors: VectorData[]) => Promise<void>;
  searchVectors: (
    clusterId: string, 
    collectionName: string, 
    queryVector: number[], 
    topK?: number, 
    filter?: string
  ) => Promise<SearchResult[]>;
  
  // Utility functions
  createDefaultTextCollection: (clusterId: string, name?: string) => Promise<void>;
  createDefaultImageCollection: (clusterId: string, name?: string) => Promise<void>;
}

interface UseMilvusReturn {
  service: MilvusService;
  operations: MilvusOperations;
  loading: boolean;
  error: MilvusError | null;
  clearError: () => void;
}

/**
 * Custom hook for Milvus/Zilliz operations
 * Provides a React-friendly interface for vector database operations
 */
export function useMilvus({ onError }: UseMilvusOptions = {}): UseMilvusReturn {
  const [service] = useState(() => createMilvusService());
  const { loading, error, execute, reset } = useAsync(async (fn: () => Promise<any>) => {
    return await fn();
  });

  // Handle errors
  const handleError = useCallback((err: MilvusError) => {
    if (onError) {
      onError(err);
    }
  }, [onError]);

  // Cluster operations
  const createCluster = useCallback(async (clusterName: string): Promise<string> => {
    return execute(async () => {
      const clusterId = await service.createCluster(clusterName);
      return clusterId;
    });
  }, [service, execute, handleError]);

  const getClusterStatus = useCallback(async (clusterId: string): Promise<string> => {
    return execute(async () => {
      return await service.getClusterStatus(clusterId);
    });
  }, [service, execute, handleError]);

  // Collection operations
  const createCollection = useCallback(async (clusterId: string, schema: CollectionSchema): Promise<void> => {
    return execute(async () => {
      await service.createCollection(clusterId, schema);
    });
  }, [service, execute, handleError]);

  const deleteCollection = useCallback(async (clusterId: string, collectionName: string): Promise<void> => {
    return execute(async () => {
      await service.deleteCollection(clusterId, collectionName);
    });
  }, [service, execute, handleError]);

  // Vector operations
  const insertVectors = useCallback(async (
    clusterId: string, 
    collectionName: string, 
    vectors: VectorData[]
  ): Promise<void> => {
    return execute(async () => {
      await service.insertVectors(clusterId, collectionName, vectors);
    });
  }, [service, execute, handleError]);

  const searchVectors = useCallback(async (
    clusterId: string,
    collectionName: string,
    queryVector: number[],
    topK: number = 10,
    filter?: string
  ): Promise<SearchResult[]> => {
    return execute(async () => {
      return await service.searchVectors(clusterId, collectionName, queryVector, topK, filter);
    });
  }, [service, execute, handleError]);

  // Utility functions
  const createDefaultTextCollection = useCallback(async (clusterId: string, name?: string): Promise<void> => {
    const schema = {
      ...defaultSchemas.textEmbeddings,
      name: name || defaultSchemas.textEmbeddings.name
    };
    return createCollection(clusterId, schema);
  }, [createCollection]);

  const createDefaultImageCollection = useCallback(async (clusterId: string, name?: string): Promise<void> => {
    const schema = {
      ...defaultSchemas.imageEmbeddings,
      name: name || defaultSchemas.imageEmbeddings.name
    };
    return createCollection(clusterId, schema);
  }, [createCollection]);

  const operations: MilvusOperations = {
    createCluster,
    getClusterStatus,
    createCollection,
    deleteCollection,
    insertVectors,
    searchVectors,
    createDefaultTextCollection,
    createDefaultImageCollection
  };

  return {
    service,
    operations,
    loading,
    error: error ? new MilvusError(error, 'UNKNOWN_ERROR') : null,
    clearError: reset
  };
}

/**
 * Hook for workspace-specific Milvus operations
 * Automatically handles cluster creation and management for a workspace
 */
export function useWorkspaceMilvus(workspaceId: string) {
  const [clusterId, setClusterId] = useState<string | null>(null);
  const [clusterStatus, setClusterStatus] = useState<string>('unknown');
  
  const milvus = useMilvus({ 
    onError: (error) => {
      console.error('Milvus operation failed:', error);
    }
  });

  // Initialize cluster for workspace
  const initializeCluster = useCallback(async (clusterName?: string): Promise<string> => {
    const name = clusterName || `workspace-${workspaceId}`;
    const newClusterId = await milvus.operations.createCluster(workspaceId, name);
    setClusterId(newClusterId);
    return newClusterId;
  }, [workspaceId, milvus.operations]);

  // Check cluster status
  const checkClusterStatus = useCallback(async (targetClusterId?: string): Promise<string> => {
    const id = targetClusterId || clusterId;
    if (!id) {
      throw new MilvusError('No cluster ID available', 'NO_CLUSTER_ID');
    }
    
    const status = await milvus.operations.getClusterStatus(id);
    setClusterStatus(status);
    return status;
  }, [clusterId, milvus.operations]);

  // Operations that automatically use the workspace cluster
  const workspaceOperations = {
    ...milvus.operations,
    initializeCluster,
    checkClusterStatus,
    
    // Override operations to use workspace cluster automatically
    createCollection: (schema: CollectionSchema) => {
      if (!clusterId) {
        throw new MilvusError('Cluster not initialized for workspace', 'NO_CLUSTER');
      }
      return milvus.operations.createCollection(clusterId, schema);
    },
    
    deleteCollection: (collectionName: string) => {
      if (!clusterId) {
        throw new MilvusError('Cluster not initialized for workspace', 'NO_CLUSTER');
      }
      return milvus.operations.deleteCollection(clusterId, collectionName);
    },
    
    insertVectors: (collectionName: string, vectors: VectorData[]) => {
      if (!clusterId) {
        throw new MilvusError('Cluster not initialized for workspace', 'NO_CLUSTER');
      }
      return milvus.operations.insertVectors(clusterId, collectionName, vectors);
    },
    
    searchVectors: (collectionName: string, queryVector: number[], topK?: number, filter?: string) => {
      if (!clusterId) {
        throw new MilvusError('Cluster not initialized for workspace', 'NO_CLUSTER');
      }
      return milvus.operations.searchVectors(clusterId, collectionName, queryVector, topK, filter);
    },
    
    createDefaultTextCollection: (name?: string) => {
      if (!clusterId) {
        throw new MilvusError('Cluster not initialized for workspace', 'NO_CLUSTER');
      }
      return milvus.operations.createDefaultTextCollection(clusterId, name);
    },
    
    createDefaultImageCollection: (name?: string) => {
      if (!clusterId) {
        throw new MilvusError('Cluster not initialized for workspace', 'NO_CLUSTER');
      }
      return milvus.operations.createDefaultImageCollection(clusterId, name);
    }
  };

  return {
    ...milvus,
    clusterId,
    clusterStatus,
    operations: workspaceOperations
  };
}

export type { MilvusOperations, UseMilvusReturn };