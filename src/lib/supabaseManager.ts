
import { supabase } from "@/integrations/supabase/client";

class SupabaseConnectionManager {
  private activeConnections = new Set<string>();
  private connectionCount = 0;
  private maxConnections = 15;
  private lastCleanup = Date.now();
  private cleanupInterval = 10 * 60 * 1000; // Increased to 10 minutes

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
    
    // Only refresh auth if there's an active session
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session && session.access_token) {
        const { error } = await supabase.auth.refreshSession();
        if (error && error.message !== 'Auth session missing!') {
          console.warn('Auth refresh failed:', error);
        }
      }
    } catch (error) {
      // Silently handle auth errors to prevent console spam
      if (error instanceof Error && !error.message.includes('Auth session missing')) {
        console.warn('Auth cleanup error:', error);
      }
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
  
  // Reduced cleanup frequency to every 10 minutes
  setInterval(() => {
    supabaseManager.cleanup();
  }, 10 * 60 * 1000);
  
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      // Only cleanup if we haven't cleaned up recently
      const timeSinceLastCleanup = Date.now() - supabaseManager.getStats().lastCleanup;
      if (timeSinceLastCleanup > 5 * 60 * 1000) { // 5 minutes
        supabaseManager.cleanup();
      }
    }
  });
}
