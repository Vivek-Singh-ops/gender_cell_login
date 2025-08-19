import { useState, useCallback } from 'react';

export function useErrorHandler() {
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const executeAsync = useCallback(async (asyncFunction, options = {}) => {
    const { 
      successMessage = null,
      onSuccess = null,
      onError = null 
    } = options;

    try {
      setLoading(true);
      setError(null);
      
      const result = await asyncFunction();
      
      if (onSuccess) onSuccess(result);
      if (successMessage) {
        console.log(successMessage);
      }
      
      return result;
    } catch (err) {
      console.error('Async operation failed:', err);
      
      const errorMessage = getErrorMessage(err);
      setError(errorMessage);
      
      if (onError) onError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const clearError = useCallback(() => setError(null), []);

  return { error, loading, executeAsync, clearError };
}

function getErrorMessage(error) {
  if (error.code === 'permission-denied') {
    return 'You don\'t have permission to perform this action';
  } else if (error.code === 'unavailable') {
    return 'Service temporarily unavailable. Please try again.';
  } else if (error.code === 'unauthenticated') {
    return 'Your session has expired. Please log in again.';
  } else if (error.code === 'not-found') {
    return 'The requested data was not found';
  } else if (error.code === 'quota-exceeded') {
    return 'Service limit reached. Please try again later.';
  } else if (error.message?.includes('network') || error.code === 'offline') {
    return 'Network error. Please check your connection.';
  } else if (error.message?.includes('timeout')) {
    return 'Request timed out. Please try again.';
  }
  
  return error.message || 'An unexpected error occurred';
}