/**
 * S3 URL builder
 * Backend stores only the S3 key (e.g., posts/uuid/filename.jpg)
 * Frontend builds the full CDN URL from the key
 */

const S3_BASE = import.meta.env.PUBLIC_S3_BUCKET_URL || 'https://serverless-blog-post-media-dev.s3.ap-south-1.amazonaws.com';

export function buildImageUrl(key: string | null | undefined): string | null {
  if (!key) return null;
  return `${S3_BASE}/${key}`;
}
