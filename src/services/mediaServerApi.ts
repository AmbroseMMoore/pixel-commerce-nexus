
import { supabase } from "@/integrations/supabase/client";

export interface MediaServerApiConfig {
  id: string;
  api_url: string;
  active_or_no: boolean;
  order_of_procedence: number;
}

export interface MediaUploadResult {
  success: boolean;
  filename?: string;
  url?: string;
  error?: string;
}

export interface CustomFilenameResult {
  customFilename: string;
  fileType: string;
}

// Get active media server configuration
export const getActiveMediaServerConfig = async (): Promise<MediaServerApiConfig | null> => {
  const { data, error } = await supabase
    .from('media_server_api_table')
    .select('*')
    .eq('active_or_no', true)
    .order('order_of_procedence')
    .limit(1)
    .single();

  if (error) {
    console.error('Error fetching media server config:', error);
    return null;
  }

  return data;
};

// Generate custom filename according to your specifications
export const generateCustomFilename = (originalFilename: string): CustomFilenameResult => {
  // Get file extension
  const ext = originalFilename.split('.').pop()?.toLowerCase() || 'jpg';
  
  // Get base filename without extension and trim to 150 characters
  let baseName = originalFilename.replace(/\.[^/.]+$/, "");
  if (baseName.length > 150) {
    baseName = baseName.substring(0, 150);
  }
  
  // Clean filename to match server.js logic: replace non-alphanumeric chars with underscore
  const safeName = baseName.replace(/[^a-zA-Z0-9_-]/g, '_');
  
  // Generate datetime suffix: ddmmyyyyhrhrminminsecmilliseconds
  const now = new Date();
  const day = String(now.getDate()).padStart(2, '0');
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const year = now.getFullYear();
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');
  const milliseconds = String(now.getMilliseconds()).padStart(3, '0');
  
  // const dateTimeSuffix = `${day}${month}${year}${hours}${minutes}${seconds}${milliseconds}`;
  const dateTimeSuffix = `${year}${month}${day}T${hours}${minutes}${seconds}${milliseconds}`;
  
  return {
    customFilename: `${safeName}_${dateTimeSuffix}`,
    fileType: ext
  };
};

// Upload file to media server
export const uploadToMediaServer = async (
  file: File,
  customFilename: string
): Promise<MediaUploadResult> => {
  try {
    const mediaServerConfig = await getActiveMediaServerConfig();
    if (!mediaServerConfig) {
      throw new Error('No active media server configuration found');
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('filename', customFilename);

    const response = await fetch(`https://${mediaServerConfig.api_url}upload`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Upload failed with status ${response.status}`);
    }

    const result = await response.json();
    
    if (result.success) {
      return {
        success: true,
        filename: result.filename,
        url: result.url
      };
    } else {
      return {
        success: false,
        error: result.error || 'Upload failed'
      };
    }
  } catch (error: any) {
    console.error('Media server upload error:', error);
    return {
      success: false,
      error: error.message || 'Upload failed'
    };
  }
};

// Get file URL from media server
export const getMediaFileUrl = async (filename: string, fileType: string): Promise<string> => {
  const mediaServerConfig = await getActiveMediaServerConfig();
  if (!mediaServerConfig) {
    return '';
  }
  
  return `https://${mediaServerConfig.api_url}file/${filename}.${fileType}`;
};

// Delete file from media server
export const deleteFromMediaServer = async (filename: string, fileType: string): Promise<boolean> => {
  try {
    const mediaServerConfig = await getActiveMediaServerConfig();
    if (!mediaServerConfig) {
      console.error('No active media server configuration found');
      return false;
    }

    const fullFilename = `${filename}.${fileType}`;
    const response = await fetch(`https://${mediaServerConfig.api_url}delete/${fullFilename}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error(`Delete failed with status ${response.status}`);
    }

    const result = await response.json();
    return result.success;
  } catch (error) {
    console.error('Media server delete error:', error);
    return false;
  }
};
