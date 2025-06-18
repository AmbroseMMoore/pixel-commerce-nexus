
import { supabase } from '@/integrations/supabase/client';
import { MEDIA_STORAGE_CONFIG, isCloudStorage, isCustomStorage, testCustomStorageConnectivity } from '@/config/mediaStorage';

export interface UploadResult {
  url: string;
  error?: string;
  debug?: any;
}

export const uploadMedia = async (file: File): Promise<UploadResult> => {
  console.log('Starting media upload with file:', {
    name: file.name,
    size: file.size,
    type: file.type,
    storageType: MEDIA_STORAGE_CONFIG.type
  });

  if (isCloudStorage()) {
    return uploadToCloud(file);
  } else if (isCustomStorage()) {
    return uploadToCustom(file);
  } else {
    return uploadToLocal(file);
  }
};

const uploadToCloud = async (file: File): Promise<UploadResult> => {
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from(MEDIA_STORAGE_CONFIG.cloudConfig!.bucket)
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    const { data } = supabase.storage
      .from(MEDIA_STORAGE_CONFIG.cloudConfig!.bucket)
      .getPublicUrl(filePath);

    return { url: data.publicUrl };
  } catch (error: any) {
    return { url: '', error: error.message };
  }
};

const uploadToCustom = async (file: File): Promise<UploadResult> => {
  try {
    console.log('Testing custom storage connectivity...');
    const connectivity = await testCustomStorageConnectivity();
    console.log('Connectivity test results:', connectivity);

    // Determine which URL to use based on connectivity
    let uploadUrl = MEDIA_STORAGE_CONFIG.customConfig!.uploadUrl;
    let publicBaseUrl = MEDIA_STORAGE_CONFIG.customConfig!.publicUrl;

    if (!connectivity.https && connectivity.http) {
      // Fallback to HTTP if HTTPS fails
      uploadUrl = uploadUrl.replace('https://', 'http://');
      publicBaseUrl = MEDIA_STORAGE_CONFIG.customConfig!.httpUrl;
      console.log('Falling back to HTTP due to HTTPS connectivity issues');
    }

    console.log('Using upload URL:', uploadUrl);
    console.log('Using public base URL:', publicBaseUrl);

    const formData = new FormData();
    formData.append('file', file);
    
    // Add timestamp for unique filename
    const timestamp = Date.now();
    const fileExt = file.name.split('.').pop();
    const uniqueFilename = `${timestamp}_${Math.random().toString(36).substring(2)}.${fileExt}`;
    formData.append('filename', uniqueFilename);

    console.log('Uploading file with data:', {
      originalName: file.name,
      uniqueFilename: uniqueFilename,
      fileSize: file.size,
      uploadUrl: uploadUrl
    });

    const response = await fetch(uploadUrl, {
      method: 'POST',
      body: formData,
      headers: {
        // Don't set Content-Type header, let browser set it with boundary for FormData
      },
    });

    console.log('Upload response status:', response.status);
    console.log('Upload response headers:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Upload failed with response:', errorText);
      throw new Error(`Upload failed with status ${response.status}: ${errorText}`);
    }

    let result;
    try {
      result = await response.json();
      console.log('Upload result:', result);
    } catch (jsonError) {
      // If JSON parsing fails, try to get text response
      const textResponse = await response.text();
      console.log('Non-JSON response received:', textResponse);
      
      // Assume success if we get a 200 status
      result = { 
        success: true, 
        filename: uniqueFilename,
        message: textResponse 
      };
    }
    
    // Construct the public URL for the uploaded file
    const publicUrl = `${publicBaseUrl}${result.filename || uniqueFilename}`;
    console.log('Final public URL:', publicUrl);
    
    return { 
      url: publicUrl,
      debug: {
        uploadUrl,
        publicBaseUrl,
        uniqueFilename,
        serverResponse: result,
        connectivity
      }
    };
  } catch (error: any) {
    console.error('Custom upload error:', error);
    return { 
      url: '', 
      error: error.message,
      debug: {
        errorType: error.constructor.name,
        errorMessage: error.message,
        stack: error.stack
      }
    };
  }
};

const uploadToLocal = async (file: File): Promise<UploadResult> => {
  try {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Upload failed');
    }

    const result = await response.json();
    
    // Construct the public URL for local storage
    const publicUrl = `${MEDIA_STORAGE_CONFIG.localConfig!.publicPath}/${result.filename}`;
    
    return { url: publicUrl };
  } catch (error: any) {
    return { url: '', error: error.message };
  }
};

export const deleteMedia = async (url: string): Promise<boolean> => {
  console.log('Attempting to delete media:', url);
  
  if (isCloudStorage()) {
    return deleteFromCloud(url);
  } else if (isCustomStorage()) {
    return deleteFromCustom(url);
  } else {
    return deleteFromLocal(url);
  }
};

const deleteFromCloud = async (url: string): Promise<boolean> => {
  try {
    // Extract file path from URL
    const urlParts = url.split('/');
    const fileName = urlParts[urlParts.length - 1];
    
    const { error } = await supabase.storage
      .from(MEDIA_STORAGE_CONFIG.cloudConfig!.bucket)
      .remove([fileName]);

    return !error;
  } catch (error) {
    console.error('Error deleting from cloud:', error);
    return false;
  }
};

const deleteFromCustom = async (url: string): Promise<boolean> => {
  try {
    console.log('Deleting from custom storage:', url);
    
    // Determine which delete URL to use
    let deleteUrl = MEDIA_STORAGE_CONFIG.customConfig!.uploadUrl;
    
    // Test connectivity first
    const connectivity = await testCustomStorageConnectivity();
    if (!connectivity.https && connectivity.http) {
      deleteUrl = deleteUrl.replace('https://', 'http://');
    }

    const response = await fetch(deleteUrl, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ url }),
    });

    console.log('Delete response status:', response.status);
    return response.ok;
  } catch (error) {
    console.error('Error deleting from custom storage:', error);
    return false;
  }
};

const deleteFromLocal = async (url: string): Promise<boolean> => {
  try {
    const response = await fetch('/api/upload', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ url }),
    });

    return response.ok;
  } catch (error) {
    console.error('Error deleting from local storage:', error);
    return false;
  }
};

// Helper function to verify if a file exists at the given URL
export const verifyMediaExists = async (url: string): Promise<boolean> => {
  try {
    console.log('Verifying media exists at:', url);
    const response = await fetch(url, { method: 'HEAD', mode: 'no-cors' });
    const exists = response.ok;
    console.log('Media verification result:', exists);
    return exists;
  } catch (error) {
    console.error('Error verifying media:', error);
    return false;
  }
};
