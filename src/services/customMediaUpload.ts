
export interface CustomMediaUploadResult {
  success: boolean;
  url?: string;
  filename?: string;
  error?: string;
}

export interface MediaFile {
  file: File;
  imageName: string;
  imageFileType: string;
}

// Generate unique image name
export const generateUniqueImageName = (originalName: string): string => {
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(2, 8);
  const baseName = originalName.split('.')[0].replace(/[^a-zA-Z0-9]/g, '_');
  return `${baseName}_${timestamp}_${randomString}`;
};

// Get file extension/type
export const getFileType = (filename: string): string => {
  const extension = filename.split('.').pop()?.toLowerCase();
  return extension || 'jpeg';
};

// Upload single file to custom media server
export const uploadToCustomMediaServer = async (
  file: File, 
  customFilename?: string
): Promise<CustomMediaUploadResult> => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    
    if (customFilename) {
      formData.append('filename', customFilename);
    }

    const response = await fetch('https://bucket.ezeelux.in/cutebae_app/upload', {
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
        url: result.url,
        filename: result.filename
      };
    } else {
      return {
        success: false,
        error: result.error || 'Upload failed'
      };
    }
  } catch (error: any) {
    console.error('Custom media upload error:', error);
    return {
      success: false,
      error: error.message || 'Upload failed'
    };
  }
};

// Upload multiple files with generated names
export const uploadMultipleFiles = async (files: File[]): Promise<MediaFile[]> => {
  const mediaFiles: MediaFile[] = [];
  
  for (const file of files) {
    const imageName = generateUniqueImageName(file.name);
    const imageFileType = getFileType(file.name);
    const fullFilename = `${imageName}.${imageFileType}`;
    
    const result = await uploadToCustomMediaServer(file, fullFilename);
    
    if (result.success && result.filename) {
      mediaFiles.push({
        file,
        imageName: result.filename.split('.')[0], // Remove extension for storage
        imageFileType
      });
    } else {
      throw new Error(`Failed to upload ${file.name}: ${result.error}`);
    }
  }
  
  return mediaFiles;
};

// Delete file from custom media server
export const deleteFromCustomMediaServer = async (filename: string): Promise<boolean> => {
  try {
    const response = await fetch(`https://bucket.ezeelux.in/cutebae_app/delete/${filename}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error(`Delete failed with status ${response.status}`);
    }

    const result = await response.json();
    return result.success;
  } catch (error) {
    console.error('Custom media delete error:', error);
    return false;
  }
};

// Get public URL for file
export const getCustomMediaUrl = (imageName: string, imageFileType: string): string => {
  return `https://bucket.ezeelux.in/cutebae_app/file/${imageName}.${imageFileType}`;
};
