import { useState, useCallback, useRef, useEffect } from 'react';

export interface AsyncState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

export interface AsyncOptions {
  immediate?: boolean;
  onSuccess?: (data: any) => void;
  onError?: (error: string) => void;
}

export interface UseAsyncReturn<T, P extends any[] = []> {
  data: T | null;
  loading: boolean;
  error: string | null;
  execute: (...args: P) => Promise<T | null>;
  reset: () => void;
  setData: (data: T | null) => void;
  setError: (error: string | null) => void;
}

export function useAsync<T, P extends any[] = []>(
  asyncFunction: (...args: P) => Promise<T>,
  options: AsyncOptions = {}
): UseAsyncReturn<T, P> {
  const { immediate = false, onSuccess, onError } = options;
  
  const [state, setState] = useState<AsyncState<T>>({
    data: null,
    loading: immediate,
    error: null,
  });
  
  const mountedRef = useRef(true);
  const lastCallIdRef = useRef(0);
  
  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);
  
  const execute = useCallback(
    async (...args: P): Promise<T | null> => {
      const callId = ++lastCallIdRef.current;
      
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      try {
        const result = await asyncFunction(...args);
        
        // Only update state if this is the latest call and component is mounted
        if (callId === lastCallIdRef.current && mountedRef.current) {
          setState({ data: result, loading: false, error: null });
          onSuccess?.(result);
        }
        
        return result;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'An error occurred';
        
        // Only update state if this is the latest call and component is mounted
        if (callId === lastCallIdRef.current && mountedRef.current) {
          setState({ data: null, loading: false, error: errorMessage });
          onError?.(errorMessage);
        }
        
        return null;
      }
    },
    [asyncFunction, onSuccess, onError]
  );
  
  const reset = useCallback(() => {
    setState({ data: null, loading: false, error: null });
    lastCallIdRef.current++; // Cancel any pending requests
  }, []);
  
  const setData = useCallback((data: T | null) => {
    setState(prev => ({ ...prev, data }));
  }, []);
  
  const setError = useCallback((error: string | null) => {
    setState(prev => ({ ...prev, error, loading: false }));
  }, []);
  
  return {
    data: state.data,
    loading: state.loading,
    error: state.error,
    execute,
    reset,
    setData,
    setError,
  };
}

export default useAsync;