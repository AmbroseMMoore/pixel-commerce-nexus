
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const MediaStorageConfig = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Media Storage Configuration</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Storage Type</span>
            <Badge variant="default">Media Server</Badge>
          </div>
          <div className="text-sm text-gray-600">
            All media files are now handled through your configured media server using unified endpoints for upload, fetch, and delete operations.
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default MediaStorageConfig;
