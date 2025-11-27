
import { supabase } from "@/integrations/supabase/client";

class SupabaseConnectionManager {
  private activeConnections = new Set<string>();
  private connectionCount = 0;
  private maxConnections = 20; // Increased limit
  private lastCleanup = Date.now();
  private cleanupInterval = 15 * 60 * 1000; // Reduced to 15 minutes

  trackConnection(queryKey: string) {
    this.connectionCount++;
    this.activeConnections.add(queryKey);
    
    if (this.connectionCount > this.maxConnections) {
      this.cleanup();
    }
    
    if (Date.now() - this.lastCleanup > this.cleanupInterval) {
      this.cleanup();
    }
  }

  untrackConnection(queryKey: string) {
    this.activeConnections.delete(queryKey);
    this.connectionCount = Math.max(0, this.connectionCount - 1);
  }

  async cleanup() {
    this.activeConnections.clear();
    this.connectionCount = 0;
    this.lastCleanup = Date.now();
    
    // Minimal auth refresh - only when critically needed
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.access_token && session.expires_at) {
        const tokenExpiry = session.expires_at * 1000;
        const now = Date.now();
        
        // Only refresh if token expires within next 3 minutes
        if (tokenExpiry - now < 3 * 60 * 1000) {
          await supabase.auth.refreshSession();
        }
      }
    } catch {
      // Silently handle errors
    }
  }

  getStats() {
    return {
      activeConnections: this.activeConnections.size,
      connectionCount: this.connectionCount,
      lastCleanup: this.lastCleanup,
    };
  }

  forceCleanup() {
    return this.cleanup();
  }
}

export const supabaseManager = new SupabaseConnectionManager();

if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    supabaseManager.forceCleanup();
  });
  
  // Cleanup every 20 minutes instead of 15
  setInterval(() => {
    supabaseManager.cleanup();
  }, 20 * 60 * 1000);
  
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      const timeSinceLastCleanup = Date.now() - supabaseManager.getStats().lastCleanup;
      if (timeSinceLastCleanup > 15 * 60 * 1000) { // 15 minutes
        supabaseManager.cleanup();
      }
    }
  });
}
