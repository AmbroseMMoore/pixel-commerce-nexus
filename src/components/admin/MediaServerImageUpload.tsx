
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload, X, Loader2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { uploadToMediaServer, generateCustomFilename, getMediaFileUrl } from '@/services/mediaServerApi';

interface MediaServerImageUploadProps {
  label: string;
  value: string;
  filename?: string;
  fileType?: string;
  onChange: (url: string, filename: string, fileType: string) => void;
  onRemove?: () => void;
}

const MediaServerImageUpload = ({ 
  label, 
  value, 
  filename,
  fileType,
  onChange,
  onRemove 
}: MediaServerImageUploadProps) => {
  const [isUploading, setIsUploading] = useState(false);

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
        description: "Image must be smaller than 10MB",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);

    try {
      const { customFilename, fileType: detectedFileType } = generateCustomFilename(file.name);
      
      const result = await uploadToMediaServer(file, customFilename);
      
      if (result.success && result.filename) {
        // Extract filename without extension for storage
        const storedFilename = result.filename.replace(/\.[^/.]+$/, "");
        const fullUrl = await getMediaFileUrl(storedFilename, detectedFileType);
        
        onChange(fullUrl, storedFilename, detectedFileType);
        
        toast({
          title: "Upload successful",
          description: "Image uploaded successfully to media server",
        });
      } else {
        throw new Error(result.error || 'Upload failed');
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
      // Reset input
      event.target.value = '';
    }
  };

  const clearImage = () => {
    if (onRemove) {
      onRemove();
    } else {
      onChange('', '', '');
    }
  };

  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium">{label}</Label>
      
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
          {filename && fileType && (
            <div className="absolute bottom-2 left-2 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded">
              {filename}.{fileType}
            </div>
          )}
        </div>
      )}

      <div>
        <Input
          type="file"
          accept="image/*"
          onChange={handleFileUpload}
          disabled={isUploading}
          className="hidden"
          id={`file-upload-${label.replace(/\s+/g, '-')}`}
        />
        <Label
          htmlFor={`file-upload-${label.replace(/\s+/g, '-')}`}
          className="flex items-center justify-center w-full h-10 px-4 py-2 border border-input bg-background hover:bg-accent hover:text-accent-foreground rounded-md cursor-pointer"
        >
          {isUploading ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Upload className="h-4 w-4 mr-2" />
          )}
          {isUploading ? 'Uploading...' : 'Upload Image'}
        </Label>
      </div>

      <div className="text-xs text-gray-500">
        Supported formats: JPG, PNG, WebP | Max size: 10MB
      </div>
    </div>
  );
};

export default MediaServerImageUpload;
