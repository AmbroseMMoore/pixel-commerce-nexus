
import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
      retry: (failureCount, error: any) => {
        // Don't retry auth errors
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

// Simplified cache cleanup - only when really needed
if (typeof window !== 'undefined') {
  // Basic cleanup every 15 minutes
  setInterval(() => {
    const cache = queryClient.getQueryCache();
    const queries = cache.getAll();
    
    // Only remove very old, unused queries
    const twentyMinutesAgo = Date.now() - 20 * 60 * 1000;
    let removed = 0;
    
    queries.forEach(query => {
      if ((query.state.dataUpdatedAt || 0) < twentyMinutesAgo && query.getObserversCount() === 0) {
        cache.remove(query);
        removed++;
      }
    });
    
    if (removed > 0) {
      console.log(`🧹 Cleaned up ${removed} stale queries`);
    }
  }, 15 * 60 * 1000);
}
