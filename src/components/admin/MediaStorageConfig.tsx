
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { MEDIA_STORAGE_CONFIG, MediaStorageType } from '@/config/mediaStorage';

interface MediaStorageConfigProps {
  onConfigChange?: (config: any) => void;
}

const MediaStorageConfig = ({ onConfigChange }: MediaStorageConfigProps) => {
  const [storageType, setStorageType] = React.useState<MediaStorageType>(MEDIA_STORAGE_CONFIG.type);
  const [localPath, setLocalPath] = React.useState(MEDIA_STORAGE_CONFIG.localConfig?.uploadPath || '/uploads');
  const [cloudBucket, setCloudBucket] = React.useState(MEDIA_STORAGE_CONFIG.cloudConfig?.bucket || 'cms-images');
  const [customUrl, setCustomUrl] = React.useState(MEDIA_STORAGE_CONFIG.customConfig?.publicUrl || 'http://168.231.123.27/cutebae/media/');

  const handleSave = () => {
    // In a real implementation, you would save this to a config file or database
    // For now, we'll just show a toast
    let storageTypeName = 'Local Storage';
    if (storageType === 'cloud') storageTypeName = 'Cloud Storage';
    if (storageType === 'custom') storageTypeName = 'Custom Storage';

    toast({
      title: "Configuration Updated",
      description: `Media storage set to ${storageTypeName}`,
    });

    if (onConfigChange) {
      onConfigChange({
        type: storageType,
        localPath,
        cloudBucket,
        customUrl
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Media Storage Configuration</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <Label className="text-base font-medium">Storage Type</Label>
          <RadioGroup value={storageType} onValueChange={(value) => setStorageType(value as MediaStorageType)} className="mt-2">
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="custom" id="custom" />
              <Label htmlFor="custom">Custom Storage Server (Default)</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="cloud" id="cloud" />
              <Label htmlFor="cloud">Cloud Storage (Supabase)</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="local" id="local" />
              <Label htmlFor="local">Local Server Storage</Label>
            </div>
          </RadioGroup>
        </div>

        {storageType === 'custom' && (
          <div>
            <Label htmlFor="customUrl">Custom Storage URL</Label>
            <Input
              id="customUrl"
              value={customUrl}
              onChange={(e) => setCustomUrl(e.target.value)}
              placeholder="http://168.231.123.27/cutebae/media/"
            />
            <p className="text-sm text-gray-500 mt-1">
              Images will be uploaded to your custom storage server
            </p>
          </div>
        )}

        {storageType === 'cloud' && (
          <div>
            <Label htmlFor="bucket">Cloud Storage Bucket</Label>
            <Input
              id="bucket"
              value={cloudBucket}
              onChange={(e) => setCloudBucket(e.target.value)}
              placeholder="cms-images"
            />
            <p className="text-sm text-gray-500 mt-1">
              Images will be stored in Supabase Storage with public access
            </p>
          </div>
        )}

        {storageType === 'local' && (
          <div>
            <Label htmlFor="localPath">Local Storage Path</Label>
            <Input
              id="localPath"
              value={localPath}
              onChange={(e) => setLocalPath(e.target.value)}
              placeholder="/uploads"
            />
            <p className="text-sm text-gray-500 mt-1">
              Images will be stored in your server's file system at this path
            </p>
            <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
              <p className="text-sm text-yellow-800">
                <strong>Note:</strong> For local storage to work, you need to implement the upload API endpoint at <code>/api/upload</code> on your server.
              </p>
            </div>
          </div>
        )}

        <Button onClick={handleSave} className="w-full">
          Save Configuration
        </Button>
      </CardContent>
    </Card>
  );
};

export default MediaStorageConfig;
