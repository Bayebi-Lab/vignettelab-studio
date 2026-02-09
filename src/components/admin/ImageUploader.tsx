import { useState, useCallback } from 'react';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ImageUploaderProps {
  onImagesChange: (files: File[]) => void;
  maxImages?: number;
}

export function ImageUploader({ onImagesChange, maxImages = 50 }: ImageUploaderProps) {
  const [images, setImages] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragging(false);

      const files = Array.from(e.dataTransfer.files).filter((file) =>
        file.type.startsWith('image/')
      );

      const newImages = [...images, ...files].slice(0, maxImages);
      setImages(newImages);
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
      setImages(newImages);
      onImagesChange(newImages);
    },
    [images, maxImages, onImagesChange]
  );

  const removeImage = useCallback(
    (index: number) => {
      const newImages = images.filter((_, i) => i !== index);
      setImages(newImages);
      onImagesChange(newImages);
    },
    [images, onImagesChange]
  );

  return (
    <div className="space-y-4">
      <div
        onDrop={handleDrop}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        className={cn(
          'border-2 border-dashed rounded-lg p-6 text-center transition-colors',
          isDragging
            ? 'border-primary bg-primary/5'
            : 'border-muted-foreground/25 hover:border-primary/50',
          images.length >= maxImages && 'opacity-50 cursor-not-allowed'
        )}
      >
        <input
          type="file"
          id="final-image-upload"
          multiple
          accept="image/*"
          onChange={handleFileInput}
          disabled={images.length >= maxImages}
          className="hidden"
        />
        <label
          htmlFor="final-image-upload"
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
                : 'Drag & drop final portraits here, or click to select'}
            </p>
            <p className="text-xs text-muted-foreground">
              Upload processed portrait images (JPG, PNG, WEBP)
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
                  alt={`Final portrait ${index + 1}`}
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
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
