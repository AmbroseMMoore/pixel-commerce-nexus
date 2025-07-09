import { useState, useCallback, useRef, useEffect } from 'react';
import { toast } from '@/hooks/use-toast';
import { uploadToMediaServer, generateCustomFilename, getMediaFileUrl } from '@/services/mediaServerApi';

interface UploadTask {
  id: string;
  file: File;
  colorId: string;
  imageIndex: number;
  onSuccess: (url: string, filename: string, fileType: string) => void;
  onError: (error: string) => void;
}

interface UploadProgress {
  id: string;
  status: 'pending' | 'uploading' | 'completed' | 'error';
  progress: number;
  error?: string;
}

export const useImageUploadQueue = () => {
  const [uploadQueue, setUploadQueue] = useState<UploadTask[]>([]);
  const [uploadProgress, setUploadProgress] = useState<Map<string, UploadProgress>>(new Map());
  const [isProcessing, setIsProcessing] = useState(false);
  const processingRef = useRef(false);

  const addToQueue = useCallback((
    file: File,
    colorId: string,
    imageIndex: number,
    onSuccess: (url: string, filename: string, fileType: string) => void,
    onError: (error: string) => void
  ) => {
    const taskId = `${colorId}-${imageIndex}-${Date.now()}`;
    
    // Validate file
    if (!file.type.startsWith('image/')) {
      onError('Invalid file type. Please select an image file.');
      return;
    }

    if (file.size > 10485760) {
      onError('File too large. Image must be smaller than 10MB.');
      return;
    }

    const task: UploadTask = {
      id: taskId,
      file,
      colorId,
      imageIndex,
      onSuccess,
      onError
    };

    setUploadQueue(prev => [...prev, task]);
    setUploadProgress(prev => new Map(prev).set(taskId, {
      id: taskId,
      status: 'pending',
      progress: 0
    }));

    return taskId;
  }, []);

  const processQueue = useCallback(async () => {
    if (processingRef.current || uploadQueue.length === 0) {
      return;
    }

    processingRef.current = true;
    setIsProcessing(true);

    try {
      // Process uploads sequentially to maintain order
      for (const task of uploadQueue) {
        try {
          // Update status to uploading
          setUploadProgress(prev => new Map(prev).set(task.id, {
            id: task.id,
            status: 'uploading',
            progress: 0
          }));

          // Generate filename
          const filenameResult = generateCustomFilename(task.file.name);
          const { customFilename, fileType } = filenameResult;

          // Update progress
          setUploadProgress(prev => new Map(prev).set(task.id, {
            id: task.id,
            status: 'uploading',
            progress: 50
          }));

          // Upload to media server
          const result = await uploadToMediaServer(task.file, customFilename);

          if (result.success && result.filename) {
            // Extract filename without extension for storage
            const storedFilename = result.filename.replace(/\.[^/.]+$/, "");
            const fullUrl = await getMediaFileUrl(storedFilename, fileType);

            // Update progress to completed
            setUploadProgress(prev => new Map(prev).set(task.id, {
              id: task.id,
              status: 'completed',
              progress: 100
            }));

            // Call success callback
            task.onSuccess(fullUrl, storedFilename, fileType);

            toast({
              title: "Upload successful",
              description: `Image ${task.imageIndex + 1} uploaded successfully`,
            });
          } else {
            throw new Error(result.error || 'Upload failed');
          }
        } catch (error: any) {
          console.error('Upload error for task:', task.id, error);
          
          // Update progress to error
          setUploadProgress(prev => new Map(prev).set(task.id, {
            id: task.id,
            status: 'error',
            progress: 0,
            error: error.message
          }));

          // Call error callback
          task.onError(error.message || 'Upload failed');

          toast({
            title: "Upload failed",
            description: `Failed to upload image ${task.imageIndex + 1}: ${error.message}`,
            variant: "destructive",
          });
        }
      }

      // Clear completed queue
      setUploadQueue([]);
      
    } finally {
      processingRef.current = false;
      setIsProcessing(false);
    }
  }, [uploadQueue]);

  // Auto-process queue when tasks are added
  useEffect(() => {
    if (uploadQueue.length > 0 && !processingRef.current) {
      processQueue();
    }
  }, [uploadQueue, processQueue]);

  const cancelUpload = useCallback((taskId: string) => {
    setUploadQueue(prev => prev.filter(task => task.id !== taskId));
    setUploadProgress(prev => {
      const newMap = new Map(prev);
      newMap.delete(taskId);
      return newMap;
    });
  }, []);

  const clearCompleted = useCallback(() => {
    setUploadProgress(prev => {
      const newMap = new Map();
      for (const [key, value] of prev) {
        if (value.status !== 'completed') {
          newMap.set(key, value);
        }
      }
      return newMap;
    });
  }, []);

  const getUploadStatus = useCallback((taskId: string) => {
    return uploadProgress.get(taskId);
  }, [uploadProgress]);

  return {
    addToQueue,
    cancelUpload,
    clearCompleted,
    getUploadStatus,
    isProcessing,
    queueLength: uploadQueue.length,
    uploadProgress: Array.from(uploadProgress.values())
  };
};