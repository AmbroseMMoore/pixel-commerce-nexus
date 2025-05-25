
import { supabase } from "@/integrations/supabase/client";

class SupabaseConnectionManager {
  private activeConnections = new Set<string>();
  private connectionCount = 0;
  private maxConnections = 50; // Increased threshold
  private lastCleanup = Date.now();

  trackConnection(queryKey: string) {
    this.connectionCount++;
    this.activeConnections.add(queryKey);
    
    // Only cleanup if we really exceed limits
    if (this.connectionCount > this.maxConnections * 2) {
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
    
    // Only refresh session if it's actually needed
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session && session.access_token) {
        const tokenExpiry = session.expires_at ? session.expires_at * 1000 : 0;
        const now = Date.now();
        
        // Only refresh if token expires within next 5 minutes
        if (tokenExpiry - now < 5 * 60 * 1000) {
          console.log('🔄 Refreshing auth session...');
          await supabase.auth.refreshSession();
        }
      }
    } catch (error) {
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

// Cleanup only on page unload
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    supabaseManager.forceCleanup();
  });
}
