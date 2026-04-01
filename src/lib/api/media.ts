import { apiPost } from './client';
import type { PresignedUrlRequest, PresignedUrlResponse } from './types';

export async function getPresignedUrlApi(data: PresignedUrlRequest): Promise<PresignedUrlResponse> {
  const response = await apiPost<{ success: boolean; data: PresignedUrlResponse }>('/media/presigned-url', data, true);
  return response.data;
}

export async function uploadToS3(presignedUrl: string, file: File): Promise<void> {
  const res = await fetch(presignedUrl, {
    method: 'PUT',
    headers: { 'Content-Type': file.type },
    body: file
  });
  if (!res.ok) throw new Error('Upload to S3 failed');
}
