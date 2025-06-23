
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload, X, Image, Loader2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { uploadToMediaServer, generateCustomFilename, getFileType, getActiveMediaServerConfig } from '@/services/mediaServerApi';

interface MediaServerImageUploadProps {
  label: string;
  value: string;
  onChange: (url: string, filename?: string, fileType?: string) => void;
  placeholder?: string;
  maxFiles?: number;
}

const MediaServerImageUpload = ({ 
  label, 
  value, 
  onChange, 
  placeholder,
  maxFiles = 1 
}: MediaServerImageUploadProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(false);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length === 0) return;

    // Validate file types
    for (const file of files) {
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Invalid file type",
          description: `${file.name} is not an image file`,
          variant: "destructive",
        });
        return;
      }

      // Validate file size (10MB)
      if (file.size > 10485760) {
        toast({
          title: "File too large",
          description: `${file.name} is larger than 10MB`,
          variant: "destructive",
        });
        return;
      }
    }

    setIsUploading(true);

    try {
      const mediaServerConfig = await getActiveMediaServerConfig();
      if (!mediaServerConfig) {
        throw new Error('No active media server configuration found');
      }

      // For single file upload
      if (maxFiles === 1 && files.length === 1) {
        const file = files[0];
        const customFilename = generateCustomFilename([file], 0);
        const fileType = getFileType(file.name);
        const fullFilename = `${customFilename}.${fileType}`;
        
        const result = await uploadToMediaServer(file, fullFilename, mediaServerConfig.api_url);
        
        if (result.success && result.filename) {
          const filename = result.filename.split('.')[0]; // Remove extension
          const displayUrl = `https://${mediaServerConfig.api_url}file/${result.filename}`;
          onChange(displayUrl, filename, fileType);
          
          toast({
            title: "Upload successful",
            description: "Image uploaded successfully to media server",
          });
        } else {
          throw new Error(result.error || 'Upload failed');
        }
      }
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

  const clearImage = () => {
    onChange('');
  };

  return (
    <div className="space-y-2">
      <Label className="flex items-center gap-2">
        {label}
        <div className="flex items-center gap-1 text-xs text-gray-500">
          <Image className="h-3 w-3" />
          <span>media server</span>
        </div>
      </Label>

      {/* Image Dimension Guidelines */}
      <div className="bg-blue-50 border border-blue-200 p-3 rounded-md">
        <h4 className="text-sm font-medium text-blue-800 mb-2">Recommended Image Dimensions:</h4>
        <div className="text-xs text-blue-700 space-y-1">
          <div><strong>Product Images:</strong> 800x800px (1:1 ratio)</div>
          <div><strong>Hero Slider:</strong> 1920x800px (16:6.7 ratio)</div>
          <div><strong>Category Images:</strong> 400x300px (4:3 ratio)</div>
          <div><strong>Banner/Promotional:</strong> 1200x400px (3:1 ratio)</div>
        </div>
        <p className="text-xs text-blue-600 mt-2">
          <strong>Format:</strong> JPG/PNG/WebP | <strong>Max Size:</strong> 10MB
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
            multiple={maxFiles > 1}
            onChange={handleFileUpload}
            disabled={isUploading}
            className="hidden"
            id={`file-upload-${label}`}
          />
          <Label
            htmlFor={`file-upload-${label}`}
            className="flex items-center justify-center w-full h-10 px-4 py-2 border border-input bg-background hover:bg-accent hover:text-accent-foreground rounded-md cursor-pointer"
          >
            {isUploading ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Upload className="h-4 w-4 mr-2" />
            )}
            {isUploading ? 'Uploading...' : 'Upload to Media Server'}
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

      <div className="text-xs text-gray-500">
        Files will be uploaded to: bucket.trulle.in/cutebae_app/
      </div>
    </div>
  );
};

export default MediaServerImageUpload;
