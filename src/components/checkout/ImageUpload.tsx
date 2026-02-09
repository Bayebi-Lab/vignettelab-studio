import { useState, useCallback } from 'react';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ImageUploadProps {
  images: File[];
  onImagesChange: (images: File[]) => void;
  maxImages?: number;
  minImages?: number;
}

export function ImageUpload({
  images,
  onImagesChange,
  maxImages = 10,
  minImages = 5,
}: ImageUploadProps) {
  const [isDragging, setIsDragging] = useState(false);

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragging(false);

      const files = Array.from(e.dataTransfer.files).filter((file) =>
        file.type.startsWith('image/')
      );

      const newImages = [...images, ...files].slice(0, maxImages);
      onImagesChange(newImages);
    },
    [images, maxImages, onImagesChange]
  );

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files || []).filter((file) =>
        file.type.startsWith('image/')
      );

      const newImages = [...images, ...files].slice(0, maxImages);
      onImagesChange(newImages);
    },
    [images, maxImages, onImagesChange]
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
              Upload {minImages}-{maxImages} images (JPG, PNG, WEBP)
            </p>
          </div>
          {images.length < maxImages && (
            <Button type="button" variant="outline" size="sm">
              Select Images
            </Button>
          )}
        </label>
      </div>

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
                  {image.name}
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
