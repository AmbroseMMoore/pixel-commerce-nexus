
import { supabase } from '@/integrations/supabase/client';
import { MEDIA_STORAGE_CONFIG, isCloudStorage, isCustomStorage } from '@/config/mediaStorage';

export interface UploadResult {
  url: string;
  error?: string;
}

export const uploadMedia = async (file: File): Promise<UploadResult> => {
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
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(MEDIA_STORAGE_CONFIG.customConfig!.uploadUrl, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Upload failed');
    }

    const result = await response.json();
    
    // Construct the public URL for custom storage
    const publicUrl = `${MEDIA_STORAGE_CONFIG.customConfig!.publicUrl}${result.filename}`;
    
    return { url: publicUrl };
  } catch (error: any) {
    return { url: '', error: error.message };
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
    const response = await fetch(MEDIA_STORAGE_CONFIG.customConfig!.uploadUrl, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ url }),
    });

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
