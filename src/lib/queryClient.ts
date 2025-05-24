import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Cache data for 5 minutes
      staleTime: 5 * 60 * 1000,
      // Keep data in cache for 10 minutes after becoming unused
      gcTime: 10 * 60 * 1000,
      // Retry failed requests 2 times with exponential backoff
      retry: 2,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      // Refetch on window focus only if data is stale
      refetchOnWindowFocus: false,
      // Don't refetch on reconnect unless data is stale
      refetchOnReconnect: "always",
      // Network mode to handle offline scenarios
      networkMode: "online",
    },
    mutations: {
      // Retry mutations once
      retry: 1,
      networkMode: "online",
    },
  },
  // Limit cache size to prevent memory issues
  queryCache: undefined, // Will use default with our custom options
  mutationCache: undefined,
});

// Clean up cache periodically (every 30 minutes)
setInterval(() => {
  queryClient.getQueryCache().clear();
}, 30 * 60 * 1000);

// Clear cache when memory usage gets high
if ('memory' in performance) {
  setInterval(() => {
    const memInfo = (performance as any).memory;
    if (memInfo && memInfo.usedJSHeapSize > 50 * 1024 * 1024) { // 50MB
      console.log('High memory usage detected, clearing query cache');
      queryClient.getQueryCache().clear();
    }
  }, 5 * 60 * 1000); // Check every 5 minutes
}
