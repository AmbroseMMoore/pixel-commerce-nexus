
import React, { useEffect, useState } from 'react';
import { useCacheManager } from '@/hooks/useCacheManager';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const PerformanceMonitor = () => {
  const { getCacheStats, clearCache } = useCacheManager();
  const [stats, setStats] = useState<any>(null);
  const [showMonitor, setShowMonitor] = useState(false);

  useEffect(() => {
    if (showMonitor) {
      const updateStats = () => {
        setStats(getCacheStats());
      };

      updateStats();
      const interval = setInterval(updateStats, 2000);

      return () => clearInterval(interval);
    }
  }, [showMonitor, getCacheStats]);

  // Only show in development or for admin users
  if (process.env.NODE_ENV === 'production' && !window.location.href.includes('admin')) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {!showMonitor ? (
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowMonitor(true)}
          className="bg-white shadow-lg"
        >
          Monitor
        </Button>
      ) : (
        <Card className="w-80 bg-white shadow-lg">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex justify-between items-center">
              Performance Monitor
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowMonitor(false)}
              >
                ×
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="text-xs space-y-2">
            {stats && (
              <>
                <div>Total Queries: {stats.totalQueries}</div>
                <div>Stale Queries: {stats.staleQueries}</div>
                <div>Fetching: {stats.fetchingQueries}</div>
                <div>Supabase Connections: {stats.supabaseStats.activeConnections}</div>
                <div className="space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={clearCache}
                    className="text-xs"
                  >
                    Clear Cache
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default PerformanceMonitor;
