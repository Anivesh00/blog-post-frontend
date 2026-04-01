// ─────────────────────────────────────────────────────────────────────────
// User & Auth Types
// ─────────────────────────────────────────────────────────────────────────

export interface User {
  id: string;
  email: string;
  username: string;
  full_name: string | null;
  role: 'user' | 'admin';
  is_active?: boolean;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  username: string;
  password: string;
  full_name?: string;
}

export interface RefreshRequest {
  refreshToken: string;
}

export interface LogoutRequest {
  refreshToken: string;
}

// ─────────────────────────────────────────────────────────────────────────
// Post Types
// ─────────────────────────────────────────────────────────────────────────

export interface Post {
  id: string;
  title: string;
  slug: string;
  content?: string; // only in single post fetch
  excerpt: string;
  cover_image: string | null;
  status: 'draft' | 'published';
  tags: string[];
  view_count: number;
  published_at: string | null;
  created_at: string;
  updated_at: string;
  author_id: string;
  author_username: string;
  author_name?: string;
}

export interface CreatePostRequest {
  title: string;
  content: string;
  excerpt?: string;
  cover_image?: string;
  status?: 'draft' | 'published';
  tags?: string[];
}

export interface UpdatePostRequest {
  title?: string;
  content?: string;
  excerpt?: string;
  cover_image?: string;
  status?: 'draft' | 'published';
  tags?: string[];
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PostListResponse {
  posts: Post[];
  pagination: Pagination;
}

// ─────────────────────────────────────────────────────────────────────────
// Comment Types
// ─────────────────────────────────────────────────────────────────────────

export interface Comment {
  id: string;
  post_id: string;
  author_id: string;
  author_username: string;
  parent_id: string | null;
  content: string;
  is_deleted: boolean;
  created_at: string;
  updated_at: string;
  childComments: Comment[]; // recursive tree
}

export interface CreateCommentRequest {
  content: string;
  parent_id?: string | null;
}

export interface UpdateCommentRequest {
  content: string;
}

// ─────────────────────────────────────────────────────────────────────────
// Media Types
// ─────────────────────────────────────────────────────────────────────────

export interface PresignedUrlResponse {
  presignedUrl: string;
  key: string;
  expiresIn: number;
}

export interface PresignedUrlRequest {
  fileName: string;
  contentType: string;
}

// ─────────────────────────────────────────────────────────────────────────
// Error Types
// ─────────────────────────────────────────────────────────────────────────

export interface ErrorResponse {
  statusCode: number;
  message: string;
}

// ─────────────────────────────────────────────────────────────────────────
// Query Parameter Types
// ─────────────────────────────────────────────────────────────────────────

export interface PostListQuery {
  page?: number;
  limit?: number;
  status?: 'draft' | 'published';
  author_id?: string;
  tag?: string;
}
