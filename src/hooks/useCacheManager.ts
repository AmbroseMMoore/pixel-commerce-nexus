
import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabaseManager } from '@/lib/supabaseManager';

export const useCacheManager = () => {
  const queryClient = useQueryClient();

  useEffect(() => {
    // Monitor cache size and clean up if needed
    const monitorCache = () => {
      const queryCache = queryClient.getQueryCache();
      const queries = queryCache.getAll();
      
      // If we have too many cached queries, remove the oldest ones
      if (queries.length > 50) {
        console.log('Cache size limit reached, cleaning up old queries');
        
        // Sort by last update time and remove oldest 20
        const sortedQueries = queries
          .sort((a, b) => (a.state.dataUpdatedAt || 0) - (b.state.dataUpdatedAt || 0))
          .slice(0, 20);
          
        sortedQueries.forEach(query => {
          queryCache.remove(query);
        });
      }
    };

    // Check cache every 2 minutes
    const interval = setInterval(monitorCache, 2 * 60 * 1000);

    // Cleanup on unmount
    return () => {
      clearInterval(interval);
    };
  }, [queryClient]);

  // Provide manual cache control functions
  const clearCache = () => {
    queryClient.clear();
    supabaseManager.forceCleanup();
  };

  const clearSpecificCache = (queryKeys: string[]) => {
    queryKeys.forEach(key => {
      queryClient.removeQueries({ queryKey: [key] });
    });
  };

  const getCacheStats = () => {
    const queryCache = queryClient.getQueryCache();
    const queries = queryCache.getAll();
    
    return {
      totalQueries: queries.length,
      staleQueries: queries.filter(q => q.isStale()).length,
      fetchingQueries: queries.filter(q => q.state.isFetching).length,
      supabaseStats: supabaseManager.getStats(),
    };
  };

  return {
    clearCache,
    clearSpecificCache,
    getCacheStats,
  };
};
