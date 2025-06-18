
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
  };
}

// Updated configuration to use your custom storage as default
export const MEDIA_STORAGE_CONFIG: MediaStorageConfig = {
  type: 'custom', // Changed to use custom storage
  cloudConfig: {
    bucket: 'cms-images',
    publicUrl: 'https://hvqdzrztwjegbtpixmke.supabase.co/storage/v1/object/public/cms-images/'
  },
  localConfig: {
    uploadPath: '/uploads',
    publicPath: '/uploads'
  },
  customConfig: {
    uploadUrl: 'http://168.231.123.27/cutebae/media/upload.php', // Assuming PHP upload script
    publicUrl: 'http://168.231.123.27/cutebae/media/'
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
