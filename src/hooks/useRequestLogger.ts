
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface LogEntry {
  user_id?: string;
  request_type: 'api' | 'link' | 'others';
  requested_url: string;
  header_data?: any;
  session_id?: string;
  response_status?: string;
}

interface AdminSettings {
  id: string;
  keep_logs: boolean;
}

export const useRequestLogger = () => {
  const { user } = useAuth();
  const [settings, setSettings] = useState<AdminSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load admin settings
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const { data, error } = await supabase
          .from('admin_settings')
          .select('*')
          .eq('id', 'default')
          .single();

        if (error && error.code !== 'PGRST116') {
          console.error('Error loading admin settings:', error);
        } else {
          setSettings(data || { id: 'default', keep_logs: false });
        }
      } catch (error) {
        console.error('Error loading settings:', error);
        setSettings({ id: 'default', keep_logs: false });
      } finally {
        setIsLoading(false);
      }
    };

    loadSettings();
  }, []);

  const logRequest = async (logEntry: LogEntry) => {
    if (!settings?.keep_logs) return;

    try {
      const { error } = await supabase
        .from('frontend_logs')
        .insert([{
          ...logEntry,
          user_id: user?.id || null,
          session_id: (await supabase.auth.getSession()).data.session?.access_token?.slice(-10) || null
        }]);

      if (error) {
        console.error('Error logging request:', error);
      }
    } catch (error) {
      console.error('Failed to log request:', error);
    }
  };

  const updateSettings = async (keepLogs: boolean) => {
    try {
      const { data, error } = await supabase
        .from('admin_settings')
        .upsert({ id: 'default', keep_logs: keepLogs, updated_at: new Date().toISOString() })
        .select()
        .single();

      if (error) throw error;

      setSettings(data);
      return { success: true };
    } catch (error) {
      console.error('Error updating settings:', error);
      return { success: false, error };
    }
  };

  return {
    settings,
    isLoading,
    logRequest,
    updateSettings
  };
};
