import axios from 'axios';
import { ENDPOINTS, API_CONFIG } from '../config/api';
import type { UploadedFile } from '../types';
import api, { apiDelete, apiGet } from './api';

// Response from backend file upload
interface FileUploadResponse {
  id: string;
  url: string;
  filename: string;
  original_filename: string;
  content_type: string;
  size: number;
  status: string;
}

export const fileService = {
  /**
   * Upload a file directly to the VPS filesystem.
   * Uses multipart/form-data for direct upload.
   */
  async uploadFile(
    file: File,
    onProgress?: (progress: number) => void
  ): Promise<UploadedFile> {
    // Validate file size
    if (file.size > API_CONFIG.MAX_FILE_SIZE) {
      throw new Error(`File size exceeds maximum allowed (${API_CONFIG.MAX_FILE_SIZE / 1024 / 1024}MB)`);
    }

    // Validate file type
    if (!this.isAllowedType(file.type)) {
      throw new Error(`File type '${file.type}' is not supported`);
    }

    // Create FormData for multipart upload
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await api.post<FileUploadResponse>(
        ENDPOINTS.FILES.UPLOAD,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          onUploadProgress: (progressEvent) => {
            if (progressEvent.total && onProgress) {
              const progress = Math.round((progressEvent.loaded / progressEvent.total) * 100);
              onProgress(progress);
            }
          },
        }
      );

      const data = response.data;

      return {
        id: data.id,
        url: data.url,
        filename: data.original_filename,
        content_type: data.content_type,
        size: data.size,
        status: 'ready',
        progress: 100,
      };
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.data?.detail) {
        throw new Error(error.response.data.detail);
      }
      throw error;
    }
  },

  /**
   * Get file metadata by ID.
   */
  async getFile(id: string): Promise<UploadedFile> {
    const response = await apiGet<FileUploadResponse>(ENDPOINTS.FILES.GET(id));
    return {
      id: response.id,
      url: response.url,
      filename: response.original_filename,
      content_type: response.content_type,
      size: response.size,
      status: response.status as UploadedFile['status'],
      progress: 100,
    };
  },

  /**
   * Delete a file by ID.
   */
  async deleteFile(id: string): Promise<void> {
    return apiDelete(ENDPOINTS.FILES.DELETE(id));
  },

  /**
   * Get the file type category based on MIME type.
   */
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

  /**
   * Check if a file type is allowed for upload.
   */
  isAllowedType(mimeType: string): boolean {
    return [
      ...API_CONFIG.ALLOWED_IMAGE_TYPES,
      ...API_CONFIG.ALLOWED_AUDIO_TYPES,
      ...API_CONFIG.ALLOWED_VIDEO_TYPES,
      ...API_CONFIG.ALLOWED_DOCUMENT_TYPES,
    ].includes(mimeType as never);
  },

  /**
   * Get accepted file types string for input element.
   */
  getAcceptedTypes(): string {
    return [
      ...API_CONFIG.ALLOWED_IMAGE_TYPES,
      ...API_CONFIG.ALLOWED_AUDIO_TYPES,
      ...API_CONFIG.ALLOWED_VIDEO_TYPES,
      ...API_CONFIG.ALLOWED_DOCUMENT_TYPES,
    ].join(',');
  },

  /**
   * Format file size for display.
   */
  formatFileSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  },
};
