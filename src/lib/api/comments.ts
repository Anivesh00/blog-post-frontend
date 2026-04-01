import { apiGet, apiPost, apiPut, apiDelete } from './client';
import type { Comment, CreateCommentRequest, UpdateCommentRequest } from './types';

export async function listCommentsApi(postId: string): Promise<{ comments: Comment[] }> {
  const response = await apiGet<{ success: boolean; data: { comments: Comment[] } }>(`/posts/${postId}/comments`, false);
  return response.data;
}

export async function createCommentApi(postId: string, data: CreateCommentRequest): Promise<{ comment: Comment }> {
  const response = await apiPost<{ success: boolean; data: { comment: Comment } }>(`/posts/${postId}/comments`, data, true);
  return response.data;
}

export async function updateCommentApi(postId: string, commentId: string, data: UpdateCommentRequest): Promise<{ comment: Comment }> {
  const response = await apiPut<{ success: boolean; data: { comment: Comment } }>(`/posts/${postId}/comments/${commentId}`, data, true);
  return response.data;
}

export async function deleteCommentApi(postId: string, commentId: string): Promise<{ message: string }> {
  const response = await apiDelete<{ success: boolean; data: { message: string } }>(`/posts/${postId}/comments/${commentId}`, true);
  return response.data;
}
