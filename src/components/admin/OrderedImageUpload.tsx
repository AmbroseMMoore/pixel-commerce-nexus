import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Upload, X, Loader2, GripVertical } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useImageUploadQueue } from '@/hooks/useImageUploadQueue';

interface OrderedImageUploadProps {
  label: string;
  value: string;
  filename?: string;
  fileType?: string;
  imageIndex: number;
  colorId: string;
  onChange: (url: string, filename: string, fileType: string) => void;
  onRemove?: () => void;
  disabled?: boolean;
}

const OrderedImageUpload = ({ 
  label, 
  value, 
  filename,
  fileType,
  imageIndex,
  colorId,
  onChange,
  onRemove,
  disabled = false
}: OrderedImageUploadProps) => {
  const [taskId, setTaskId] = useState<string | null>(null);
  const { addToQueue, getUploadStatus, cancelUpload } = useImageUploadQueue();
  
  const uploadStatus = taskId ? getUploadStatus(taskId) : null;
  const isUploading = uploadStatus?.status === 'uploading' || uploadStatus?.status === 'pending';

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || disabled) return;

    const newTaskId = addToQueue(
      file,
      colorId,
      imageIndex,
      (url, filename, fileType) => {
        onChange(url, filename, fileType);
        setTaskId(null);
      },
      (error) => {
        toast({
          title: "Upload failed",
          description: error,
          variant: "destructive",
        });
        setTaskId(null);
      }
    );

    if (newTaskId) {
      setTaskId(newTaskId);
    }

    // Reset input
    event.target.value = '';
  };

  const clearImage = () => {
    if (taskId) {
      cancelUpload(taskId);
      setTaskId(null);
    }
    
    if (onRemove) {
      onRemove();
    } else {
      onChange('', '', '');
    }
  };

  const getStatusColor = () => {
    switch (uploadStatus?.status) {
      case 'pending': return 'bg-yellow-500';
      case 'uploading': return 'bg-blue-500';
      case 'completed': return 'bg-green-500';
      case 'error': return 'bg-red-500';
      default: return 'bg-gray-300';
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <GripVertical className="h-4 w-4 text-gray-400" />
        <Label className="text-sm font-medium">
          {label}
          <span className="ml-2 px-2 py-1 text-xs bg-gray-100 rounded-full">
            Position {imageIndex + 1}
          </span>
        </Label>
      </div>
      
      {/* Upload Status Indicator */}
      {uploadStatus && (
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs">
            <div className={`w-2 h-2 rounded-full ${getStatusColor()}`} />
            <span className="capitalize">{uploadStatus.status}</span>
            {uploadStatus.error && (
              <span className="text-red-500">- {uploadStatus.error}</span>
            )}
          </div>
          {isUploading && (
            <Progress value={uploadStatus.progress} className="h-1" />
          )}
        </div>
      )}
      
      {value && (
        <div className="relative">
          <img
            src={value}
            alt={`Preview ${imageIndex + 1}`}
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
            disabled={isUploading}
          >
            <X className="h-4 w-4" />
          </Button>
          
          {/* Image position indicator */}
          <div className="absolute top-2 left-2 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded">
            #{imageIndex + 1}
          </div>
          
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
          disabled={isUploading || disabled}
          className="hidden"
          id={`file-upload-${colorId}-${imageIndex}`}
        />
        <Label
          htmlFor={`file-upload-${colorId}-${imageIndex}`}
          className={`flex items-center justify-center w-full h-10 px-4 py-2 border border-input bg-background hover:bg-accent hover:text-accent-foreground rounded-md cursor-pointer ${
            isUploading || disabled ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          {isUploading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              <span>
                {uploadStatus?.status === 'pending' ? 'Queued...' : 'Uploading...'}
              </span>
            </>
          ) : (
            <>
              <Upload className="h-4 w-4 mr-2" />
              Upload Image {imageIndex + 1}
            </>
          )}
        </Label>
      </div>

      <div className="text-xs text-gray-500">
        Supported formats: JPG, PNG, WebP | Max size: 10MB
        {imageIndex === 0 && <span className="text-blue-600 font-medium"> • Primary Image</span>}
      </div>
    </div>
  );
};

export default OrderedImageUpload;