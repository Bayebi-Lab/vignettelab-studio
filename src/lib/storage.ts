import { supabase } from './supabase';

const UPLOADED_IMAGES_BUCKET = 'uploaded-images';
const FINAL_IMAGES_BUCKET = 'final-images';

export interface UploadResult {
  url: string;
  path: string;
}

/**
 * Upload images to Supabase Storage
 * @param files - Array of File objects
 * @param orderId - Optional order ID for organizing files
 * @returns Array of upload results with URLs and paths
 */
export async function uploadImages(
  files: File[],
  orderId?: string
): Promise<UploadResult[]> {
  const uploadPromises = files.map(async (file, index) => {
    const fileExt = file.name.split('.').pop();
    const fileName = orderId
      ? `${orderId}/${Date.now()}-${index}.${fileExt}`
      : `temp/${Date.now()}-${index}.${fileExt}`;
    
    const { data, error } = await supabase.storage
      .from(UPLOADED_IMAGES_BUCKET)
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (error) {
      throw new Error(`Failed to upload ${file.name}: ${error.message}`);
    }

    const { data: urlData } = supabase.storage
      .from(UPLOADED_IMAGES_BUCKET)
      .getPublicUrl(data.path);

    return {
      url: urlData.publicUrl,
      path: data.path,
    };
  });

  return Promise.all(uploadPromises);
}

/**
 * Upload final processed images
 * @param files - Array of File objects
 * @param orderId - Order ID for organizing files
 * @returns Array of upload results with URLs and paths
 */
export async function uploadFinalImages(
  files: File[],
  orderId: string
): Promise<UploadResult[]> {
  const uploadPromises = files.map(async (file, index) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${orderId}/${Date.now()}-${index}.${fileExt}`;
    
    const { data, error } = await supabase.storage
      .from(FINAL_IMAGES_BUCKET)
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (error) {
      throw new Error(`Failed to upload ${file.name}: ${error.message}`);
    }

    const { data: urlData } = supabase.storage
      .from(FINAL_IMAGES_BUCKET)
      .getPublicUrl(data.path);

    return {
      url: urlData.publicUrl,
      path: data.path,
    };
  });

  return Promise.all(uploadPromises);
}

/**
 * Generate a signed URL for downloading images (expires in 7 days)
 * @param path - Storage path
 * @param bucket - Bucket name
 * @returns Signed URL
 */
export async function getSignedUrl(
  path: string,
  bucket: string = FINAL_IMAGES_BUCKET
): Promise<string> {
  const { data, error } = await supabase.storage
    .from(bucket)
    .createSignedUrl(path, 60 * 60 * 24 * 7); // 7 days

  if (error) {
    throw new Error(`Failed to create signed URL: ${error.message}`);
  }

  return data.signedUrl;
}

/**
 * Extract storage path from a Supabase storage URL
 * Handles both public and signed URL formats
 */
function extractStoragePathFromUrl(url: string, bucket: string): string | null {
  try {
    // Format: https://xxx.supabase.co/storage/v1/object/public/<bucket>/<path>
    const publicPrefix = `/object/public/${bucket}/`;
    const idx = url.indexOf(publicPrefix);
    if (idx !== -1) {
      return url.slice(idx + publicPrefix.length);
    }
    // Format: https://xxx.supabase.co/storage/v1/object/sign/<bucket>/<path>?token=...
    const signPrefix = `/object/sign/${bucket}/`;
    const signIdx = url.indexOf(signPrefix);
    if (signIdx !== -1) {
      const afterPrefix = url.slice(signIdx + signPrefix.length);
      const queryIdx = afterPrefix.indexOf('?');
      return queryIdx !== -1 ? afterPrefix.slice(0, queryIdx) : afterPrefix;
    }
  } catch {
    // ignore
  }
  return null;
}

/**
 * Get a signed URL for an image stored in the uploaded-images bucket (private).
 * Use this when displaying uploaded images in admin, as the bucket is private.
 * @param imageUrl - The stored URL (public URL that returns 403 for private buckets)
 * @returns Signed URL, or original URL if not a Supabase storage URL
 */
export async function getSignedUrlForUploadedImage(imageUrl: string): Promise<string> {
  const path = extractStoragePathFromUrl(imageUrl, UPLOADED_IMAGES_BUCKET);
  if (path) {
    return getSignedUrl(path, UPLOADED_IMAGES_BUCKET);
  }
  return imageUrl;
}

/**
 * Delete images from storage
 * @param paths - Array of storage paths
 * @param bucket - Bucket name
 */
export async function deleteImages(
  paths: string[],
  bucket: string = UPLOADED_IMAGES_BUCKET
): Promise<void> {
  const { error } = await supabase.storage.from(bucket).remove(paths);

  if (error) {
    throw new Error(`Failed to delete images: ${error.message}`);
  }
}
