
export type MediaStorageType = 'cloud' | 'local' | 'custom';

export interface MediaStorageConfig {
  type: MediaStorageType;
  cloudConfig?: {
    bucket: string;
    publicUrl: string;
  };
  localConfig?: {
    uploadPath: string;
    publicPath: string;
  };
  customConfig?: {
    uploadUrl: string;
    publicUrl: string;
    httpsUrl: string;
    httpUrl: string;
  };
}

// Updated configuration to use your new custom storage URL
export const MEDIA_STORAGE_CONFIG: MediaStorageConfig = {
  type: 'custom',
  cloudConfig: {
    bucket: 'cms-images',
    publicUrl: 'https://hvqdzrztwjegbtpixmke.supabase.co/storage/v1/object/public/cms-images/'
  },
  localConfig: {
    uploadPath: '/uploads',
    publicPath: '/uploads'
  },
  customConfig: {
    uploadUrl: 'https://bucket.ezeelux.in/cutebae/media/upload.php',
    publicUrl: 'https://bucket.ezeelux.in/cutebae/media/',
    httpsUrl: 'https://bucket.ezeelux.in/cutebae/media/',
    httpUrl: 'http://bucket.ezeelux.in/cutebae/media/'
  }
};

export const getMediaStorageType = (): MediaStorageType => {
  return MEDIA_STORAGE_CONFIG.type;
};

export const isCloudStorage = (): boolean => {
  return MEDIA_STORAGE_CONFIG.type === 'cloud';
};

export const isLocalStorage = (): boolean => {
  return MEDIA_STORAGE_CONFIG.type === 'local';
};

export const isCustomStorage = (): boolean => {
  return MEDIA_STORAGE_CONFIG.type === 'custom';
};

// Helper function to test URL connectivity
export const testCustomStorageConnectivity = async (): Promise<{ https: boolean; http: boolean }> => {
  const results = { https: false, http: false };
  
  try {
    // Test HTTPS first
    const httpsResponse = await fetch(MEDIA_STORAGE_CONFIG.customConfig!.httpsUrl, { 
      method: 'HEAD',
      mode: 'no-cors' 
    });
    results.https = true;
    console.log('HTTPS connection successful to:', MEDIA_STORAGE_CONFIG.customConfig!.httpsUrl);
  } catch (error) {
    console.log('HTTPS connection failed:', error);
  }
  
  try {
    // Test HTTP as fallback
    const httpResponse = await fetch(MEDIA_STORAGE_CONFIG.customConfig!.httpUrl, { 
      method: 'HEAD',
      mode: 'no-cors' 
    });
    results.http = true;
    console.log('HTTP connection successful to:', MEDIA_STORAGE_CONFIG.customConfig!.httpUrl);
  } catch (error) {
    console.log('HTTP connection failed:', error);
  }
  
  return results;
};
