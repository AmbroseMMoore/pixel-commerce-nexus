
import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabaseManager } from '@/lib/supabaseManager';

export const useCacheManager = () => {
  const queryClient = useQueryClient();

  useEffect(() => {
    // Much less aggressive monitoring
    const monitorCache = () => {
      const queryCache = queryClient.getQueryCache();
      const queries = queryCache.getAll();
      
      // Only clean up if we have way too many cached queries
      if (queries.length > 100) {
        console.log('📊 Cache size getting large, gentle cleanup');
        
        // Only remove queries with no observers (not being used)
        const unusedQueries = queries.filter(query => query.getObserversCount() === 0);
        const oldQueries = unusedQueries
          .sort((a, b) => (a.state.dataUpdatedAt || 0) - (b.state.dataUpdatedAt || 0))
          .slice(0, Math.min(20, unusedQueries.length));
          
        oldQueries.forEach(query => {
          queryCache.remove(query);
        });
      }
    };

    // Check every 10 minutes instead of 2
    const interval = setInterval(monitorCache, 10 * 60 * 1000);

    return () => {
      clearInterval(interval);
    };
  }, [queryClient]);

  const clearCache = () => {
    console.log('🧹 Manual cache clear');
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
      activeQueries: queries.filter(q => q.getObserversCount() > 0).length,
      staleQueries: queries.filter(q => q.isStale()).length,
      fetchingQueries: queries.filter(q => q.state.status === 'pending').length,
      supabaseStats: supabaseManager.getStats(),
    };
  };

  return {
    clearCache,
    clearSpecificCache,
    getCacheStats,
  };
};
