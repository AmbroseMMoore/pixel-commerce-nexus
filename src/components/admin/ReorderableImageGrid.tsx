import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowUp, ArrowDown, GripVertical } from 'lucide-react';
import OrderedImageUpload from './OrderedImageUpload';

interface ImageData {
  url: string;
  filename: string;
  fileType: string;
}

interface ReorderableImageGridProps {
  colorVariantId: string;
  colorVariantName: string;
  images: ImageData[];
  onImageChange: (imageIndex: number, url: string, filename: string, fileType: string) => void;
  onImageRemove: (imageIndex: number) => void;
  onReorder?: (oldIndex: number, newIndex: number) => void;
  maxImages?: number;
}

const ReorderableImageGrid = ({
  colorVariantId,
  colorVariantName,
  images,
  onImageChange,
  onImageRemove,
  onReorder,
  maxImages = 6
}: ReorderableImageGridProps) => {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const handleMoveUp = (index: number) => {
    if (index > 0 && onReorder) {
      onReorder(index, index - 1);
    }
  };

  const handleMoveDown = (index: number) => {
    if (index < images.length - 1 && onReorder) {
      onReorder(index, index + 1);
    }
  };

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    
    if (draggedIndex !== null && draggedIndex !== dropIndex && onReorder) {
      onReorder(draggedIndex, dropIndex);
    }
    
    setDraggedIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-lg font-medium">
          Images for {colorVariantName}
        </h4>
        <span className="text-sm text-gray-500">
          {images.filter(img => img.url).length} / {maxImages} images
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: maxImages }, (_, index) => {
          const imageData = images[index] || { url: '', filename: '', fileType: 'jpg' };
          const hasImage = Boolean(imageData.url);
          
          return (
            <Card 
              key={`${colorVariantId}-image-${index}`}
              className={`transition-all duration-200 ${
                draggedIndex === index ? 'opacity-50 scale-95' : ''
              } ${hasImage ? 'border-green-200' : 'border-gray-200'}`}
              draggable={hasImage}
              onDragStart={(e) => handleDragStart(e, index)}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, index)}
              onDragEnd={handleDragEnd}
            >
              <CardContent className="p-4">
                <div className="space-y-3">
                  {/* Reorder controls for uploaded images */}
                  {hasImage && onReorder && (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        <GripVertical className="h-4 w-4 text-gray-400 cursor-move" />
                        <span className="text-xs text-gray-500">Drag to reorder</span>
                      </div>
                      <div className="flex gap-1">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => handleMoveUp(index)}
                          disabled={index === 0}
                          className="h-6 w-6 p-0"
                        >
                          <ArrowUp className="h-3 w-3" />
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => handleMoveDown(index)}
                          disabled={index === images.length - 1}
                          className="h-6 w-6 p-0"
                        >
                          <ArrowDown className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Upload component */}
                  <OrderedImageUpload
                    label={`Image ${index + 1}`}
                    value={imageData.url}
                    filename={imageData.filename}
                    fileType={imageData.fileType}
                    imageIndex={index}
                    colorId={colorVariantId}
                    onChange={(url, filename, fileType) =>
                      onImageChange(index, url, filename, fileType)
                    }
                    onRemove={() => onImageRemove(index)}
                  />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Upload tips */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h5 className="font-medium text-blue-900 mb-2">Upload Tips:</h5>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Images will be uploaded in order - no more shuffling!</li>
          <li>• The first image will be the primary image for this color</li>
          <li>• Drag and drop images to reorder them after upload</li>
          <li>• Use the arrow buttons for precise positioning</li>
          <li>• Upload queue processes images sequentially to maintain order</li>
        </ul>
      </div>
    </div>
  );
};

export default ReorderableImageGrid;