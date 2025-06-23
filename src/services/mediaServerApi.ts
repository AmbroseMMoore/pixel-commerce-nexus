
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

export interface MediaFileData {
  file: File;
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

// Generate custom filename with timestamp and prefix handling
export const generateCustomFilename = (files: File[], index: number): string => {
  const file = files[index];
  const timestamp = new Date().getTime();
  const originalName = file.name.split('.')[0];
  
  // Strip filename to 150 characters
  let baseName = originalName.substring(0, 150).replace(/[^a-zA-Z0-9_-]/g, '_');
  
  // Check for duplicate names and add prefix if needed
  const duplicateIndex = files.slice(0, index).findIndex(f => 
    f.name.split('.')[0].substring(0, 150).replace(/[^a-zA-Z0-9_-]/g, '_') === baseName
  );
  
  if (duplicateIndex !== -1 || files.slice(index + 1).some(f => 
    f.name.split('.')[0].substring(0, 150).replace(/[^a-zA-Z0-9_-]/g, '_') === baseName
  )) {
    baseName = `${index + 1}_${baseName}`;
  }
  
  return `${baseName}_${timestamp}`;
};

// Get file extension
export const getFileType = (filename: string): string => {
  const extension = filename.split('.').pop()?.toLowerCase();
  return extension || 'jpg';
};

// Upload single file to media server
export const uploadToMediaServer = async (
  file: File,
  customFilename: string,
  apiUrl: string
): Promise<MediaUploadResult> => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('filename', customFilename);

    const response = await fetch(`https://${apiUrl}upload`, {
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

// Upload multiple files with generated names
export const uploadMultipleFiles = async (files: File[]): Promise<MediaFileData[]> => {
  const mediaServerConfig = await getActiveMediaServerConfig();
  if (!mediaServerConfig) {
    throw new Error('No active media server configuration found');
  }

  const mediaFiles: MediaFileData[] = [];
  
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const customFilename = generateCustomFilename(files, i);
    const fileType = getFileType(file.name);
    const fullFilename = `${customFilename}.${fileType}`;
    
    const result = await uploadToMediaServer(file, fullFilename, mediaServerConfig.api_url);
    
    if (result.success && result.filename) {
      mediaFiles.push({
        file,
        customFilename: result.filename.split('.')[0], // Remove extension for storage
        fileType
      });
    } else {
      throw new Error(`Failed to upload ${file.name}: ${result.error}`);
    }
  }
  
  return mediaFiles;
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

// Get public URL for file
export const getMediaServerUrl = async (filename: string, fileType: string): Promise<string> => {
  const mediaServerConfig = await getActiveMediaServerConfig();
  if (!mediaServerConfig) {
    return '';
  }
  
  return `https://${mediaServerConfig.api_url}file/${filename}.${fileType}`;
};

// Generate display URL for product image
export const generateProductImageUrl = (filename: string, fileType: string, apiUrl: string): string => {
  return `https://${apiUrl}file/${filename}.${fileType}`;
};
