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
