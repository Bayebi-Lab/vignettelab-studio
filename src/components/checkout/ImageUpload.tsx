import { useState, useCallback, useRef } from 'react';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface ImageUploadProps {
  images: File[];
  onImagesChange: (images: File[]) => void;
  maxImages?: number;
  minImages?: number;
  maxFileSizeMB?: number;
}

const MAX_FILE_SIZE_MB = 10; // 10MB per image

export function ImageUpload({
  images,
  onImagesChange,
  maxImages = 10,
  minImages = 2,
  maxFileSizeMB = MAX_FILE_SIZE_MB,
}: ImageUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [fileError, setFileError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): string | null => {
    if (!file.type.startsWith('image/')) {
      return `${file.name} is not an image file`;
    }
    if (file.size > maxFileSizeMB * 1024 * 1024) {
      return `${file.name} is too large (max ${maxFileSizeMB}MB per image)`;
    }
    return null;
  };

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragging(false);
      setFileError(null);

      const files = Array.from(e.dataTransfer.files);
      const validFiles: File[] = [];
      const errors: string[] = [];

      files.forEach((file) => {
        const error = validateFile(file);
        if (error) {
          errors.push(error);
        } else {
          validFiles.push(file);
        }
      });

      if (errors.length > 0) {
        const errorMessage = errors.join(', ');
        setFileError(errorMessage);
        toast.error(errorMessage);
      }

      if (validFiles.length > 0) {
        const newImages = [...images, ...validFiles].slice(0, maxImages);
        onImagesChange(newImages);
        if (validFiles.length < files.length) {
          toast.warning(`Only ${validFiles.length} of ${files.length} files were added`);
        }
      }
    },
    [images, maxImages, maxFileSizeMB, onImagesChange]
  );

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setFileError(null);
      const files = Array.from(e.target.files || []);
      const validFiles: File[] = [];
      const errors: string[] = [];

      files.forEach((file) => {
        const error = validateFile(file);
        if (error) {
          errors.push(error);
        } else {
          validFiles.push(file);
        }
      });

      if (errors.length > 0) {
        const errorMessage = errors.join(', ');
        setFileError(errorMessage);
        toast.error(errorMessage);
      }

      if (validFiles.length > 0) {
        const newImages = [...images, ...validFiles].slice(0, maxImages);
        onImagesChange(newImages);
        if (validFiles.length < files.length) {
          toast.warning(`Only ${validFiles.length} of ${files.length} files were added`);
        }
      }
    },
    [images, maxImages, maxFileSizeMB, onImagesChange]
  );

  const removeImage = useCallback(
    (index: number) => {
      const newImages = images.filter((_, i) => i !== index);
      onImagesChange(newImages);
    },
    [images, onImagesChange]
  );

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  return (
    <div className="space-y-4">
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={cn(
          'border-2 border-dashed rounded-lg p-8 text-center transition-colors',
          isDragging
            ? 'border-primary bg-primary/5'
            : 'border-muted-foreground/25 hover:border-primary/50',
          images.length >= maxImages && 'opacity-50 cursor-not-allowed'
        )}
      >
        <input
          ref={inputRef}
          type="file"
          id="image-upload"
          multiple
          accept="image/*"
          onChange={handleFileInput}
          disabled={images.length >= maxImages}
          className="hidden"
        />
        <label
          htmlFor="image-upload"
          className={cn(
            'cursor-pointer flex flex-col items-center gap-4',
            images.length >= maxImages && 'cursor-not-allowed'
          )}
        >
          <div className="rounded-full bg-primary/10 p-4">
            <Upload size={24} className="text-primary" />
          </div>
          <div>
            <p className="text-sm font-medium text-foreground mb-1">
              {images.length >= maxImages
                ? `Maximum ${maxImages} images reached`
                : 'Drag & drop images here, or click to select'}
            </p>
            <p className="text-xs text-muted-foreground">
              {minImages}-{maxImages} high-resolution photos: close-ups, full-body, traits (e.g. tattoos), plus inspiration images (JPG, PNG, WEBP, max {maxFileSizeMB}MB each)
            </p>
          </div>
          {images.length < maxImages && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.preventDefault();
                inputRef.current?.click();
              }}
            >
              Select Images
            </Button>
          )}
        </label>
      </div>

      {fileError && (
        <div className="bg-destructive/10 text-destructive p-3 rounded-lg text-sm">
          {fileError}
        </div>
      )}

      {images.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium text-foreground">
            Selected Images ({images.length}/{maxImages})
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {images.map((image, index) => (
              <div
                key={index}
                className="relative group aspect-square rounded-lg overflow-hidden border border-border bg-muted"
              >
                <img
                  src={URL.createObjectURL(image)}
                  alt={`Upload ${index + 1}`}
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="absolute top-2 right-2 p-1.5 rounded-full bg-destructive text-destructive-foreground opacity-0 group-hover:opacity-100 transition-opacity"
                  aria-label="Remove image"
                >
                  <X size={16} />
                </button>
                <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs p-1 truncate">
                  {image.name} ({(image.size / 1024 / 1024).toFixed(2)}MB)
                </div>
              </div>
            ))}
          </div>
          {images.length < minImages && (
            <p className="text-sm text-destructive">
              Please upload at least {minImages} images
            </p>
          )}
        </div>
      )}
    </div>
  );
}
