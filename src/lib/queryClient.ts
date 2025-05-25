
import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
      retry: (failureCount, error: any) => {
        if (error?.status >= 400 && error?.status < 500) {
          return false;
        }
        return failureCount < 2;
      },
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
      networkMode: "online",
    },
    mutations: {
      retry: 1,
      networkMode: "online",
    },
  },
});

// Gentle cache cleanup - only when really needed
if (typeof window !== 'undefined') {
  // Clean up stale queries every 10 minutes
  setInterval(() => {
    const cache = queryClient.getQueryCache();
    const queries = cache.getAll();
    
    // Only remove queries older than 15 minutes
    const fifteenMinutesAgo = Date.now() - 15 * 60 * 1000;
    let removed = 0;
    
    queries.forEach(query => {
      if ((query.state.dataUpdatedAt || 0) < fifteenMinutesAgo && query.getObserversCount() === 0) {
        cache.remove(query);
        removed++;
      }
    });
    
    if (removed > 0) {
      console.log(`🧹 Cleaned up ${removed} stale queries`);
    }
  }, 10 * 60 * 1000);

  // Memory pressure cleanup (only when necessary)
  if ('memory' in performance) {
    setInterval(() => {
      const memInfo = (performance as any).memory;
      if (memInfo && memInfo.usedJSHeapSize > 50 * 1024 * 1024) { // 50MB threshold
        console.log('🚨 High memory usage detected, clearing old cache');
        const cache = queryClient.getQueryCache();
        const queries = cache.getAll();
        
        // Only clear inactive queries
        queries.forEach(query => {
          if (query.getObserversCount() === 0) {
            cache.remove(query);
          }
        });
      }
    }, 5 * 60 * 1000);
  }
}
