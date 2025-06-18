
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload, X, Image, Cloud, Server, Globe } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { uploadMedia, deleteMedia } from '@/services/mediaUpload';
import { isCloudStorage, isCustomStorage } from '@/config/mediaStorage';

interface ImageUploadProps {
  label: string;
  value: string;
  onChange: (url: string) => void;
  placeholder?: string;
}

const ImageUpload = ({ label, value, onChange, placeholder }: ImageUploadProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(false);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file type",
        description: "Please select an image file",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (10MB)
    if (file.size > 10485760) {
      toast({
        title: "File too large",
        description: "Please select an image smaller than 10MB",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);

    try {
      const result = await uploadMedia(file);
      
      if (result.error) {
        throw new Error(result.error);
      }

      onChange(result.url);

      const storageType = isCloudStorage() ? 'cloud storage' : isCustomStorage() ? 'custom storage' : 'local storage';
      toast({
        title: "Upload successful",
        description: `Image uploaded successfully to ${storageType}`,
      });
    } catch (error: any) {
      console.error('Upload error:', error);
      toast({
        title: "Upload failed",
        description: error.message || "Failed to upload image",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleUrlChange = (url: string) => {
    onChange(url);
    setShowUrlInput(false);
  };

  const clearImage = async () => {
    if (value) {
      // Try to delete the media file if it's not a URL
      if (!value.startsWith('http')) {
        await deleteMedia(value);
      }
    }
    onChange('');
  };

  const getStorageInfo = () => {
    if (isCloudStorage()) {
      return { type: 'cloud', icon: Cloud };
    } else if (isCustomStorage()) {
      return { type: 'custom', icon: Globe };
    } else {
      return { type: 'local', icon: Server };
    }
  };

  const { type: storageType, icon: StorageIcon } = getStorageInfo();

  return (
    <div className="space-y-2">
      <Label className="flex items-center gap-2">
        {label}
        <div className="flex items-center gap-1 text-xs text-gray-500">
          <StorageIcon className="h-3 w-3" />
          <span>{storageType} storage</span>
        </div>
      </Label>

      {/* Image Dimension Guidelines */}
      <div className="bg-blue-50 border border-blue-200 p-3 rounded-md">
        <h4 className="text-sm font-medium text-blue-800 mb-2">Recommended Image Dimensions:</h4>
        <div className="text-xs text-blue-700 space-y-1">
          <div><strong>Hero Slider:</strong> 1920x800px (16:6.7 ratio)</div>
          <div><strong>Product Images:</strong> 800x800px (1:1 ratio)</div>
          <div><strong>Category Images:</strong> 400x300px (4:3 ratio)</div>
          <div><strong>Banner/Promotional:</strong> 1200x400px (3:1 ratio)</div>
          <div><strong>Thumbnails:</strong> 300x300px (1:1 ratio)</div>
          <div><strong>Blog/Article:</strong> 1200x630px (16:8.4 ratio)</div>
        </div>
        <p className="text-xs text-blue-600 mt-2">
          <strong>Format:</strong> JPG/PNG | <strong>Max Size:</strong> 10MB | <strong>Quality:</strong> 72-150 DPI
        </p>
      </div>
      
      {value && (
        <div className="relative">
          <img
            src={value}
            alt="Preview"
            className="w-full h-32 object-cover rounded-md border"
            onError={(e) => {
              e.currentTarget.src = '/placeholder.svg';
            }}
          />
          <Button
            type="button"
            variant="destructive"
            size="sm"
            className="absolute top-2 right-2"
            onClick={clearImage}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}

      <div className="flex gap-2">
        <div className="flex-1">
          <Input
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            disabled={isUploading}
            className="hidden"
            id={`file-upload-${label}`}
          />
          <Label
            htmlFor={`file-upload-${label}`}
            className="flex items-center justify-center w-full h-10 px-4 py-2 border border-input bg-background hover:bg-accent hover:text-accent-foreground rounded-md cursor-pointer"
          >
            <Upload className="h-4 w-4 mr-2" />
            {isUploading ? 'Uploading...' : `Upload to ${storageType}`}
          </Label>
        </div>
        
        <Button
          type="button"
          variant="outline"
          onClick={() => setShowUrlInput(!showUrlInput)}
          className="px-3"
        >
          <Image className="h-4 w-4" />
        </Button>
      </div>

      {showUrlInput && (
        <div className="flex gap-2">
          <Input
            placeholder={placeholder || "Enter image URL"}
            defaultValue={value}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleUrlChange(e.currentTarget.value);
              }
            }}
          />
          <Button
            type="button"
            onClick={() => {
              const input = document.querySelector(`input[placeholder="${placeholder || "Enter image URL"}"]`) as HTMLInputElement;
              if (input) {
                handleUrlChange(input.value);
              }
            }}
          >
            Set
          </Button>
        </div>
      )}

      {storageType === 'custom' && (
        <p className="text-xs text-gray-500">
          Images will be uploaded to: http://168.231.123.27/cutebae/media/
        </p>
      )}

      {storageType === 'local' && (
        <p className="text-xs text-gray-500">
          Note: Local storage requires server-side upload handling
        </p>
      )}
    </div>
  );
};

export default ImageUpload;
