import { apiGet, apiPost, apiPut, apiDelete } from './client';
import type { Post, PostListResponse, CreatePostRequest, UpdatePostRequest, PostListQuery } from './types';

export async function listPostsApi(query: PostListQuery = {}): Promise<PostListResponse> {
  const params = new URLSearchParams();
  if (query.page) params.set('page', String(query.page));
  if (query.limit) params.set('limit', String(query.limit));
  if (query.status) params.set('status', query.status);
  if (query.author_id) params.set('author_id', query.author_id);
  if (query.tag) params.set('tag', query.tag);
  const qs = params.toString();
  const response = await apiGet<{ success: boolean; data: PostListResponse }>(`/posts${qs ? `?${qs}` : ''}`, false);
  return response.data;
}

export async function getPostApi(idOrSlug: string): Promise<{ post: Post }> {
  const response = await apiGet<{ success: boolean; data: { post: Post } }>(`/posts/${idOrSlug}`, false);
  return response.data;
}

export async function createPostApi(data: CreatePostRequest): Promise<{ post: Post }> {
  const response = await apiPost<{ success: boolean; data: { post: Post } }>('/posts', data, true);
  return response.data;
}

export async function updatePostApi(id: string, data: UpdatePostRequest): Promise<{ post: Post }> {
  const response = await apiPut<{ success: boolean; data: { post: Post } }>(`/posts/${id}`, data, true);
  return response.data;
}

export async function deletePostApi(id: string): Promise<{ message: string }> {
  const response = await apiDelete<{ success: boolean; data: { message: string } }>(`/posts/${id}`, true);
  return response.data;
}
