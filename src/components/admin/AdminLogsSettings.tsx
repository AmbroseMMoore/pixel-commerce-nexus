
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Loader2, Settings, Save } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useRequestLogger } from '@/hooks/useRequestLogger';

const AdminLogsSettings = () => {
  const { settings, isLoading, updateSettings } = useRequestLogger();
  const [keepLogs, setKeepLogs] = useState<string>('no');
  const [isSaving, setIsSaving] = useState(false);

  React.useEffect(() => {
    if (settings) {
      setKeepLogs(settings.keep_logs ? 'yes' : 'no');
    }
  }, [settings]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const result = await updateSettings(keepLogs === 'yes');
      
      if (result.success) {
        toast({
          title: "Settings Updated",
          description: `Logging has been ${keepLogs === 'yes' ? 'enabled' : 'disabled'}.`,
        });
      } else {
        throw new Error('Failed to update settings');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update settings. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin mr-2" />
          <span>Loading settings...</span>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Request Logging Settings
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <Label className="text-base font-medium">Keep Logs</Label>
          <RadioGroup value={keepLogs} onValueChange={setKeepLogs}>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="yes" id="yes" />
              <Label htmlFor="yes">Yes - Track all frontend requests</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="no" id="no" />
              <Label htmlFor="no">No - Disable request logging</Label>
            </div>
          </RadioGroup>
          
          {keepLogs === 'yes' && (
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <p className="text-sm text-blue-800">
                When enabled, the system will log:
              </p>
              <ul className="text-xs text-blue-700 mt-2 space-y-1">
                <li>• User ID (if logged in)</li>
                <li>• Request type (API, Link, Others)</li>
                <li>• Requested URL</li>
                <li>• Header data (for API requests)</li>
                <li>• Session ID</li>
                <li>• Request timestamp</li>
                <li>• Response status</li>
              </ul>
            </div>
          )}
        </div>

        <Button 
          onClick={handleSave} 
          disabled={isSaving}
          className="w-full"
        >
          {isSaving ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              Saving...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Save Settings
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};

export default AdminLogsSettings;
