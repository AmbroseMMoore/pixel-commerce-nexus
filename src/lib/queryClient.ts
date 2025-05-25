
import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 2 * 60 * 1000, // Reduced to 2 minutes
      gcTime: 5 * 60 * 1000, // Reduced to 5 minutes
      retry: (failureCount, error: any) => {
        if (error?.status >= 400 && error?.status < 500) {
          return false;
        }
        return failureCount < 1; // Reduced retry attempts
      },
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 15000), // Reduced max delay
      refetchOnWindowFocus: false,
      refetchOnReconnect: false, // Disabled to reduce load
      networkMode: "online",
      meta: {
        errorBoundary: true,
      },
    },
    mutations: {
      retry: 0, // No retries for mutations
      networkMode: "online",
    },
  },
});

// More aggressive cache cleanup - every 5 minutes
setInterval(() => {
  const cache = queryClient.getQueryCache();
  const queries = cache.getAll();
  
  // Remove stale queries older than 5 minutes
  const fiveMinutesAgo = Date.now() - 5 * 60 * 1000;
  queries.forEach(query => {
    if ((query.state.dataUpdatedAt || 0) < fiveMinutesAgo) {
      cache.remove(query);
    }
  });
}, 5 * 60 * 1000);

// Clear cache when memory usage gets high (reduced threshold)
if (typeof window !== 'undefined' && 'memory' in performance) {
  setInterval(() => {
    const memInfo = (performance as any).memory;
    if (memInfo && memInfo.usedJSHeapSize > 30 * 1024 * 1024) { // 30MB threshold
      console.log('High memory usage detected, clearing query cache');
      queryClient.getQueryCache().clear();
    }
  }, 2 * 60 * 1000); // Check every 2 minutes
}

// More frequent localStorage cleanup
if (typeof window !== 'undefined') {
  setInterval(() => {
    try {
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith('react-query-') || key.startsWith('supabase-')) {
          localStorage.removeItem(key);
        }
      });
    } catch (error) {
      console.warn('Failed to clean localStorage:', error);
    }
  }, 30 * 60 * 1000); // Clean every 30 minutes
}
