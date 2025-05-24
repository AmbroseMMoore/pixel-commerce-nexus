import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Cache data for 5 minutes
      staleTime: 5 * 60 * 1000,
      // Keep data in cache for 10 minutes after becoming unused
      gcTime: 10 * 60 * 1000,
      // Retry failed requests 2 times with exponential backoff
      retry: (failureCount, error: any) => {
        // Don't retry on 4xx errors (client errors)
        if (error?.status >= 400 && error?.status < 500) {
          return false;
        }
        return failureCount < 2;
      },
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      // Refetch on window focus only if data is stale
      refetchOnWindowFocus: false,
      // Don't refetch on reconnect unless data is stale
      refetchOnReconnect: "always",
      // Network mode to handle offline scenarios
      networkMode: "online",
      // Prevent infinite loading states
      meta: {
        errorBoundary: true,
      },
    },
    mutations: {
      // Retry mutations once
      retry: 1,
      networkMode: "online",
    },
  },
});

// Clean up cache periodically (every 30 minutes)
setInterval(() => {
  const cache = queryClient.getQueryCache();
  const queries = cache.getAll();
  
  // Remove stale queries older than 30 minutes
  const thirtyMinutesAgo = Date.now() - 30 * 60 * 1000;
  queries.forEach(query => {
    if ((query.state.dataUpdatedAt || 0) < thirtyMinutesAgo) {
      cache.remove(query);
    }
  });
}, 30 * 60 * 1000);

// Clear cache when memory usage gets high
if (typeof window !== 'undefined' && 'memory' in performance) {
  setInterval(() => {
    const memInfo = (performance as any).memory;
    if (memInfo && memInfo.usedJSHeapSize > 50 * 1024 * 1024) { // 50MB
      console.log('High memory usage detected, clearing query cache');
      queryClient.getQueryCache().clear();
    }
  }, 5 * 60 * 1000); // Check every 5 minutes
}

// Clear localStorage periodically to prevent browser cache issues
if (typeof window !== 'undefined') {
  setInterval(() => {
    try {
      // Clear old cache entries from localStorage
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith('react-query-') || key.startsWith('supabase-')) {
          localStorage.removeItem(key);
        }
      });
    } catch (error) {
      console.warn('Failed to clean localStorage:', error);
    }
  }, 60 * 60 * 1000); // Clean every hour
}
