
import React from 'react';
import MediaServerImageUpload from './MediaServerImageUpload';

// Legacy component - redirects to MediaServerImageUpload
interface ImageUploadProps {
  label: string;
  value: string;
  onChange: (url: string) => void;
}

const ImageUpload = ({ label, value, onChange }: ImageUploadProps) => {
  return (
    <MediaServerImageUpload
      label={label}
      value={value}
      onChange={(url, filename, fileType) => onChange(url)}
    />
  );
};

export default ImageUpload;
