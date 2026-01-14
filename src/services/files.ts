import { ENDPOINTS, API_CONFIG } from '../config/api';
import type { PresignedUrlRequest, PresignedUrlResponse, UploadedFile } from '../types';
import { apiDelete, apiGet, apiPost } from './api';

export const fileService = {
  async getPresignedUrl(request: PresignedUrlRequest): Promise<PresignedUrlResponse> {
    return apiPost<PresignedUrlResponse>(ENDPOINTS.FILES.PRESIGNED_URL, request);
  },

  async uploadFile(
    file: File,
    onProgress?: (progress: number) => void
  ): Promise<UploadedFile> {
    // Validate file size
    if (file.size > API_CONFIG.MAX_FILE_SIZE) {
      throw new Error(`File size exceeds maximum allowed (${API_CONFIG.MAX_FILE_SIZE / 1024 / 1024}MB)`);
    }

    // Get presigned URL
    const { upload_url, file_url, file_id } = await this.getPresignedUrl({
      filename: file.name,
      content_type: file.type,
      size: file.size,
    });

    // Upload to S3 using presigned URL
    const xhr = new XMLHttpRequest();
    
    return new Promise((resolve, reject) => {
      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable && onProgress) {
          const progress = Math.round((event.loaded / event.total) * 100);
          onProgress(progress);
        }
      });

      xhr.addEventListener('load', async () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          // Notify backend that upload is complete
          try {
            await apiPost(ENDPOINTS.FILES.UPLOAD_COMPLETE, { file_id });
            resolve({
              id: file_id,
              url: file_url,
              filename: file.name,
              content_type: file.type,
              size: file.size,
              status: 'processing',
              progress: 100,
            });
          } catch (error) {
            reject(error);
          }
        } else {
          reject(new Error(`Upload failed with status ${xhr.status}`));
        }
      });

      xhr.addEventListener('error', () => {
        reject(new Error('Upload failed'));
      });

      xhr.open('PUT', upload_url);
      xhr.setRequestHeader('Content-Type', file.type);
      xhr.send(file);
    });
  },

  async getFile(id: string): Promise<UploadedFile> {
    return apiGet<UploadedFile>(ENDPOINTS.FILES.GET(id));
  },

  async deleteFile(id: string): Promise<void> {
    return apiDelete(ENDPOINTS.FILES.DELETE(id));
  },

  getFileType(mimeType: string): 'image' | 'audio' | 'video' | 'file' {
    if (API_CONFIG.ALLOWED_IMAGE_TYPES.includes(mimeType as typeof API_CONFIG.ALLOWED_IMAGE_TYPES[number])) {
      return 'image';
    }
    if (API_CONFIG.ALLOWED_AUDIO_TYPES.includes(mimeType as typeof API_CONFIG.ALLOWED_AUDIO_TYPES[number])) {
      return 'audio';
    }
    if (API_CONFIG.ALLOWED_VIDEO_TYPES.includes(mimeType as typeof API_CONFIG.ALLOWED_VIDEO_TYPES[number])) {
      return 'video';
    }
    return 'file';
  },

  isAllowedType(mimeType: string): boolean {
    return [
      ...API_CONFIG.ALLOWED_IMAGE_TYPES,
      ...API_CONFIG.ALLOWED_AUDIO_TYPES,
      ...API_CONFIG.ALLOWED_VIDEO_TYPES,
    ].includes(mimeType as never);
  },
};
