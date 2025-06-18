
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { MEDIA_STORAGE_CONFIG, MediaStorageType, testCustomStorageConnectivity } from '@/config/mediaStorage';
import { CheckCircle, AlertCircle } from 'lucide-react';

interface MediaStorageConfigProps {
  onConfigChange?: (config: any) => void;
}

const MediaStorageConfig = ({ onConfigChange }: MediaStorageConfigProps) => {
  const [storageType, setStorageType] = React.useState<MediaStorageType>(MEDIA_STORAGE_CONFIG.type);
  const [localPath, setLocalPath] = React.useState(MEDIA_STORAGE_CONFIG.localConfig?.uploadPath || '/uploads');
  const [cloudBucket, setCloudBucket] = React.useState(MEDIA_STORAGE_CONFIG.cloudConfig?.bucket || 'cms-images');
  const [customUrl, setCustomUrl] = React.useState(MEDIA_STORAGE_CONFIG.customConfig?.publicUrl || 'https://bucket.ezeelux.in/cutebae/media/');
  const [isTestingConnection, setIsTestingConnection] = React.useState(false);
  const [connectionStatus, setConnectionStatus] = React.useState<{ https: boolean; http: boolean } | null>(null);

  const testConnection = async () => {
    setIsTestingConnection(true);
    try {
      const result = await testCustomStorageConnectivity();
      setConnectionStatus(result);
      
      toast({
        title: "Connection Test Results",
        description: `HTTPS: ${result.https ? '✅ Working' : '❌ Failed'}, HTTP: ${result.http ? '✅ Working' : '❌ Failed'}`,
      });
    } catch (error) {
      console.error('Connection test failed:', error);
      toast({
        title: "Connection Test Failed",
        description: "Unable to test storage connectivity",
        variant: "destructive",
      });
    } finally {
      setIsTestingConnection(false);
    }
  };

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
          <div className="space-y-4">
            <div>
              <Label htmlFor="customUrl">Custom Storage URL</Label>
              <Input
                id="customUrl"
                value={customUrl}
                onChange={(e) => setCustomUrl(e.target.value)}
                placeholder="https://bucket.ezeelux.in/cutebae/media/"
              />
              <p className="text-sm text-gray-500 mt-1">
                Images will be uploaded to your custom storage server
              </p>
            </div>

            <div className="flex gap-2">
              <Button
                type="button"
                onClick={testConnection}
                disabled={isTestingConnection}
                variant="outline"
                size="sm"
              >
                {isTestingConnection ? (
                  <>
                    <AlertCircle className="h-4 w-4 mr-2 animate-spin" />
                    Testing...
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Test Connection
                  </>
                )}
              </Button>
            </div>

            {connectionStatus && (
              <div className="p-3 bg-gray-50 rounded-md">
                <h5 className="text-sm font-medium mb-2">Connection Test Results:</h5>
                <div className="text-sm space-y-1">
                  <div className={connectionStatus.https ? 'text-green-600' : 'text-red-600'}>
                    HTTPS: {connectionStatus.https ? '✅ Working' : '❌ Failed'}
                  </div>
                  <div className={connectionStatus.http ? 'text-green-600' : 'text-red-600'}>
                    HTTP: {connectionStatus.http ? '✅ Working' : '❌ Failed'}
                  </div>
                </div>
                {!connectionStatus.https && connectionStatus.http && (
                  <p className="text-sm text-amber-600 mt-2">
                    ⚠️ HTTPS failed but HTTP works. The system will automatically fallback to HTTP.
                  </p>
                )}
                {!connectionStatus.https && !connectionStatus.http && (
                  <p className="text-sm text-red-600 mt-2">
                    ❌ Both HTTPS and HTTP failed. Please check your server configuration.
                  </p>
                )}
              </div>
            )}

            <div className="bg-yellow-50 border border-yellow-200 p-3 rounded-md">
              <h5 className="text-sm font-medium text-yellow-800 mb-2">Server Setup Requirements:</h5>
              <ul className="text-xs text-yellow-700 space-y-1">
                <li>• Nginx should point to /home/username/app/media directory</li>
                <li>• Directory permissions: 755</li>
                <li>• Ownership: username:www-data</li>
                <li>• Upload script needed at: upload.php</li>
                <li>• CORS headers should be configured for cross-origin uploads</li>
              </ul>
            </div>
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
