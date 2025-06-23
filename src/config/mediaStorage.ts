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
  type: 'custom' as 'cloud' | 'local' | 'custom',
  
  cloudConfig: {
    bucket: 'cms-images',
    publicUrl: 'https://hvqdzrztwjegbtpixmke.supabase.co/storage/v1/object/public/cms-images/'
  },
  localConfig: {
    uploadPath: '/uploads',
    publicPath: '/uploads'
  },
  customConfig: {
    uploadUrl: 'https://bucket.ezeelux.in/cutebae_app/upload',
    publicUrl: 'https://bucket.ezeelux.in/cutebae_app/file/',
    httpUrl: 'http://bucket.ezeelux.in/cutebae_app/file/', // Fallback HTTP URL
    deleteUrl: 'https://bucket.ezeelux.in/cutebae_app/delete'
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
    // Test HTTPS connectivity
    const httpsResponse = await fetch('https://bucket.ezeelux.in/cutebae_app/file/test.txt', { 
      method: 'HEAD',
      mode: 'no-cors'
    });
    results.https = true;
  } catch (error) {
    console.log('HTTPS connectivity test failed:', error);
  }
  
  try {
    // Test HTTP connectivity as fallback
    const httpResponse = await fetch('http://bucket.ezeelux.in/cutebae_app/file/test.txt', { 
      method: 'HEAD',
      mode: 'no-cors'
    });
    results.http = true;
  } catch (error) {
    console.log('HTTP connectivity test failed:', error);
  }
  
  return results;
};
