
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload, X, Image, Cloud, Server } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { uploadMedia, deleteMedia } from '@/services/mediaUpload';
import { isCloudStorage } from '@/config/mediaStorage';

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

      toast({
        title: "Upload successful",
        description: `Image uploaded successfully to ${isCloudStorage() ? 'cloud storage' : 'local storage'}`,
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

  const storageType = isCloudStorage() ? 'cloud' : 'local';
  const StorageIcon = isCloudStorage() ? Cloud : Server;

  return (
    <div className="space-y-2">
      <Label className="flex items-center gap-2">
        {label}
        <div className="flex items-center gap-1 text-xs text-gray-500">
          <StorageIcon className="h-3 w-3" />
          <span>{storageType} storage</span>
        </div>
      </Label>
      
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

      {storageType === 'local' && (
        <p className="text-xs text-gray-500">
          Note: Local storage requires server-side upload handling
        </p>
      )}
    </div>
  );
};

export default ImageUpload;
