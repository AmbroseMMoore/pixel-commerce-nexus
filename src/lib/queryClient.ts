
import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes - balanced for performance
      gcTime: 10 * 60 * 1000, // 10 minutes - keep data longer
      retry: (failureCount, error: any) => {
        if (error?.status >= 400 && error?.status < 500) {
          return false;
        }
        return failureCount < 1;
      },
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 15000),
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      networkMode: "online",
      meta: {
        errorBoundary: true,
      },
    },
    mutations: {
      retry: 0,
      networkMode: "online",
    },
  },
});

// Less aggressive cache cleanup - every 10 minutes
setInterval(() => {
  const cache = queryClient.getQueryCache();
  const queries = cache.getAll();
  
  // Remove stale queries older than 15 minutes
  const fifteenMinutesAgo = Date.now() - 15 * 60 * 1000;
  queries.forEach(query => {
    if ((query.state.dataUpdatedAt || 0) < fifteenMinutesAgo) {
      cache.remove(query);
    }
  });
}, 10 * 60 * 1000);

// Clear cache only when memory usage is critically high
if (typeof window !== 'undefined' && 'memory' in performance) {
  setInterval(() => {
    const memInfo = (performance as any).memory;
    if (memInfo && memInfo.usedJSHeapSize > 100 * 1024 * 1024) { // 100MB threshold
      console.log('High memory usage detected, clearing query cache');
      queryClient.getQueryCache().clear();
    }
  }, 5 * 60 * 1000); // Check every 5 minutes
}
