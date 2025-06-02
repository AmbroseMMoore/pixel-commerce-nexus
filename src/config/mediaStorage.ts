
export type MediaStorageType = 'cloud' | 'local';

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
}

// Default configuration - you can change this to switch between storage types
export const MEDIA_STORAGE_CONFIG: MediaStorageConfig = {
  type: 'cloud', // Change to 'local' to use local storage
  cloudConfig: {
    bucket: 'cms-images',
    publicUrl: 'https://hvqdzrztwjegbtpixmke.supabase.co/storage/v1/object/public/cms-images/'
  },
  localConfig: {
    uploadPath: '/uploads', // Server path where files will be stored
    publicPath: '/uploads' // Public path to access files
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
