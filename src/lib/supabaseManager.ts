
import { supabase } from "@/integrations/supabase/client";

class SupabaseConnectionManager {
  private activeConnections = new Set<string>();
  private connectionCount = 0;
  private maxConnections = 15; // Increased limit
  private lastCleanup = Date.now();
  private cleanupInterval = 3 * 60 * 1000; // 3 minutes

  // Track active queries
  trackConnection(queryKey: string) {
    this.connectionCount++;
    this.activeConnections.add(queryKey);
    
    // Auto cleanup if too many connections
    if (this.connectionCount > this.maxConnections) {
      this.cleanup();
    }
    
    // Periodic cleanup
    if (Date.now() - this.lastCleanup > this.cleanupInterval) {
      this.cleanup();
    }
  }

  // Remove connection tracking
  untrackConnection(queryKey: string) {
    this.activeConnections.delete(queryKey);
    this.connectionCount = Math.max(0, this.connectionCount - 1);
  }

  // Cleanup old connections and refresh auth if needed
  async cleanup() {
    console.log('Cleaning up Supabase connections...');
    
    // Clear old connections
    this.activeConnections.clear();
    this.connectionCount = 0;
    this.lastCleanup = Date.now();
    
    // Refresh auth session to prevent stale tokens
    try {
      const { error } = await supabase.auth.refreshSession();
      if (error) {
        console.warn('Auth refresh failed:', error);
      }
    } catch (error) {
      console.warn('Auth refresh error:', error);
    }
  }

  // Get connection stats
  getStats() {
    return {
      activeConnections: this.activeConnections.size,
      connectionCount: this.connectionCount,
      lastCleanup: this.lastCleanup,
    };
  }

  // Force cleanup
  forceCleanup() {
    return this.cleanup();
  }
}

export const supabaseManager = new SupabaseConnectionManager();

// Cleanup on page unload
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    supabaseManager.forceCleanup();
  });
  
  // Periodic cleanup every 5 minutes (reduced from 10)
  setInterval(() => {
    supabaseManager.cleanup();
  }, 5 * 60 * 1000);
  
  // Additional cleanup on page visibility change
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      supabaseManager.cleanup();
    }
  });
}
