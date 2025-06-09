
import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Upload, X, AlertCircle, Info } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { mediaUploadService } from '@/services/mediaUpload';
import { toast } from '@/hooks/use-toast';

interface ImageUploadProps {
  onUploadComplete: (urls: string[]) => void;
  multiple?: boolean;
  maxFiles?: number;
  acceptedTypes?: string[];
  maxSizeInMB?: number;
  category?: 'product' | 'hero' | 'category' | 'general';
}

const IMAGE_DIMENSIONS = {
  product: {
    recommended: "800x800px",
    aspectRatio: "1:1 (Square)",
    description: "Product images work best as squares for consistent display in grids and carousels"
  },
  hero: {
    recommended: "1920x800px",
    aspectRatio: "16:7 (Widescreen)",
    description: "Hero images should be wide format for banner display across the full width"
  },
  category: {
    recommended: "400x400px", 
    aspectRatio: "1:1 (Square)",
    description: "Category images display as squares in the category grid layout"
  },
  general: {
    recommended: "1200x800px",
    aspectRatio: "3:2 (Standard)",
    description: "General images work well with standard photo aspect ratio"
  }
};

const ImageUpload: React.FC<ImageUploadProps> = ({
  onUploadComplete,
  multiple = false,
  maxFiles = 5,
  acceptedTypes = ['image/jpeg', 'image/png', 'image/webp'],
  maxSizeInMB = 5,
  category = 'general'
}) => {
  const [uploading, setUploading] = useState(false);
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const dimensionInfo = IMAGE_DIMENSIONS[category];

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length === 0) return;

    setError(null);
    setUploading(true);

    try {
      // Validate files
      for (const file of files) {
        if (!acceptedTypes.includes(file.type)) {
          throw new Error(`Invalid file type: ${file.name}. Please upload ${acceptedTypes.join(', ')} files only.`);
        }
        
        if (file.size > maxSizeInMB * 1024 * 1024) {
          throw new Error(`File too large: ${file.name}. Maximum size is ${maxSizeInMB}MB.`);
        }
      }

      if (multiple && files.length > maxFiles) {
        throw new Error(`Too many files. Maximum ${maxFiles} files allowed.`);
      }

      if (!multiple && files.length > 1) {
        throw new Error('Only one file allowed for this upload.');
      }

      // Upload files
      const filesToUpload = multiple ? files : [files[0]];
      const uploadPromises = filesToUpload.map(file => mediaUploadService.uploadFile(file));
      const results = await Promise.all(uploadPromises);
      
      const successfulUploads = results
        .filter(result => result.success)
        .map(result => result.url);

      if (successfulUploads.length === 0) {
        throw new Error('No files were uploaded successfully.');
      }

      const newImages = [...uploadedImages, ...successfulUploads];
      setUploadedImages(newImages);
      onUploadComplete(newImages);

      toast({
        title: "Upload Successful",
        description: `${successfulUploads.length} image(s) uploaded successfully.`,
      });

      // Clear the input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Upload failed';
      setError(errorMessage);
      toast({
        title: "Upload Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (index: number) => {
    const newImages = uploadedImages.filter((_, i) => i !== index);
    setUploadedImages(newImages);
    onUploadComplete(newImages);
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-4">
      {/* Image Dimension Guidelines */}
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          <div className="space-y-1">
            <div className="font-medium">Recommended dimensions for {category} images:</div>
            <div className="text-sm">
              <div><strong>Size:</strong> {dimensionInfo.recommended}</div>
              <div><strong>Aspect Ratio:</strong> {dimensionInfo.aspectRatio}</div>
              <div className="text-gray-600 mt-1">{dimensionInfo.description}</div>
            </div>
          </div>
        </AlertDescription>
      </Alert>

      <div>
        <Label>Upload Images</Label>
        <Input
          ref={fileInputRef}
          type="file"
          multiple={multiple}
          accept={acceptedTypes.join(',')}
          onChange={handleFileSelect}
          className="hidden"
        />
        
        <Card className="mt-2">
          <CardContent className="p-6">
            <div
              onClick={triggerFileInput}
              className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-gray-400 transition-colors"
            >
              <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <div className="text-lg font-medium text-gray-900 mb-2">
                {uploading ? 'Uploading...' : 'Click to upload images'}
              </div>
              <div className="text-sm text-gray-500">
                {multiple ? `Up to ${maxFiles} files` : 'Single file'} • 
                Max {maxSizeInMB}MB each • 
                {acceptedTypes.map(type => type.split('/')[1].toUpperCase()).join(', ')}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {uploadedImages.length > 0 && (
        <div>
          <Label>Uploaded Images</Label>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-2">
            {uploadedImages.map((url, index) => (
              <div key={index} className="relative group">
                <img
                  src={url}
                  alt={`Uploaded ${index + 1}`}
                  className="w-full h-32 object-cover rounded-lg border"
                />
                <Button
                  size="sm"
                  variant="destructive"
                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => removeImage(index)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      <Button
        onClick={triggerFileInput}
        disabled={uploading}
        variant="outline"
        className="w-full"
      >
        <Upload className="h-4 w-4 mr-2" />
        {uploading ? 'Uploading...' : 'Add More Images'}
      </Button>
    </div>
  );
};

export default ImageUpload;
