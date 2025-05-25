
import { supabase } from "@/integrations/supabase/client";

class SupabaseConnectionManager {
  private activeConnections = new Set<string>();
  private connectionCount = 0;
  private maxConnections = 30;
  private lastCleanup = Date.now();
  private cleanupInterval = 30 * 60 * 1000; // 30 minutes

  trackConnection(queryKey: string) {
    this.connectionCount++;
    this.activeConnections.add(queryKey);
    
    // Only cleanup if we're really over the limit
    if (this.connectionCount > this.maxConnections * 1.5) {
      this.cleanup();
    }
  }

  untrackConnection(queryKey: string) {
    this.activeConnections.delete(queryKey);
    this.connectionCount = Math.max(0, this.connectionCount - 1);
  }

  async cleanup() {
    console.log('🔧 Supabase connection cleanup...');
    
    this.activeConnections.clear();
    this.connectionCount = 0;
    this.lastCleanup = Date.now();
    
    // Gentle auth refresh only when needed
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session && session.access_token) {
        const tokenExpiry = session.expires_at ? session.expires_at * 1000 : 0;
        const now = Date.now();
        
        // Only refresh if token expires within next 10 minutes
        if (tokenExpiry - now < 10 * 60 * 1000) {
          console.log('🔄 Refreshing auth session...');
          await supabase.auth.refreshSession();
        }
      }
    } catch (error) {
      // Silent error handling
      console.debug('Auth cleanup note:', error instanceof Error ? error.message : 'Session refresh skipped');
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

// Reduced frequency cleanup
if (typeof window !== 'undefined') {
  // Only cleanup on page unload
  window.addEventListener('beforeunload', () => {
    supabaseManager.forceCleanup();
  });
  
  // Much less frequent automatic cleanup
  setInterval(() => {
    supabaseManager.cleanup();
  }, 30 * 60 * 1000);
}
