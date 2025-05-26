
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
    console.log('Cleaning up Supabase connections...');
    
    this.activeConnections.clear();
    this.connectionCount = 0;
    this.lastCleanup = Date.now();
    
    // Only refresh auth if there's an active session and avoid throwing errors
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session && session.access_token) {
        // Check if token is still valid before attempting refresh
        const tokenExpiry = session.expires_at ? session.expires_at * 1000 : 0;
        const now = Date.now();
        
        // Only refresh if token expires within next 5 minutes
        if (tokenExpiry - now < 5 * 60 * 1000) {
          console.log('Refreshing auth session...');
          const { error } = await supabase.auth.refreshSession();
          if (error) {
            console.warn('Auth refresh failed (this is normal if session expired):', error.message);
          }
        }
      }
    } catch (error) {
      // Silently handle auth errors to prevent console spam
      console.warn('Auth cleanup warning:', error instanceof Error ? error.message : 'Unknown error');
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
  
  // Reduced cleanup frequency to every 15 minutes
  setInterval(() => {
    supabaseManager.cleanup();
  }, 15 * 60 * 1000);
  
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      // Only cleanup if we haven't cleaned up recently
      const timeSinceLastCleanup = Date.now() - supabaseManager.getStats().lastCleanup;
      if (timeSinceLastCleanup > 10 * 60 * 1000) { // 10 minutes
        supabaseManager.cleanup();
      }
    }
  });
}
