<script lang="ts">
  import { listPostsApi, deletePostApi } from '$lib/api/posts';
  import { buildImageUrl } from '$lib/utils/s3';
  import { formatDate } from '$lib/utils/format';
  import { authState } from '$lib/stores/auth.svelte';
  import { success, error as toastError } from '$lib/stores/toast.svelte';
  import { ApiError } from '$lib/api/client';
  import type { Post, Pagination } from '$lib/api/types';
  import { goto } from '$app/navigation';
  import { onMount } from 'svelte';

  let posts = $state<Post[]>([]);
  let pagination = $state<Pagination | null>(null);
  let loading = $state(true);
  let currentPage = $state(1);
  let activeTab = $state<'all' | 'published' | 'draft'>('all');
  let deletingId = $state<string | null>(null);
  const limit = 10;

  onMount(() => {
    if (!authState.user || !authState.accessToken) goto('/login?next=/dashboard');
  });

  async function loadPosts() {
    const user = authState.user;
    if (!user) return;
    loading = true;
    try {
      const query: import('$lib/api/types').PostListQuery = {
        page: currentPage,
        limit,
        author_id: user.id
      };
      if (activeTab !== 'all') query.status = activeTab;
      const res = await listPostsApi(query);
      posts = res.posts;
      pagination = res.pagination;
    } catch {
      posts = [];
    } finally {
      loading = false;
    }
  }

  $effect(() => {
    currentPage;
    activeTab;
    loadPosts();
  });

  async function handleDelete(post: Post) {
    if (!confirm(`Delete "${post.title}"? This cannot be undone.`)) return;
    deletingId = post.id;
    try {
      await deletePostApi(post.id);
      success('Post deleted');
      await loadPosts();
    } catch (err) {
      toastError(err instanceof ApiError ? err.message : 'Failed to delete post');
    } finally {
      deletingId = null;
    }
  }

  function selectTab(tab: 'all' | 'published' | 'draft') {
    activeTab = tab;
    currentPage = 1;
  }

  const currentUser = $derived(authState.user);

  const publishedCount = $derived(posts.filter(p => p.status === 'published').length);
  const draftCount = $derived(posts.filter(p => p.status === 'draft').length);
  const totalViews = $derived(posts.reduce((sum, p) => sum + (p.view_count || 0), 0));
</script>

<svelte:head><title>Dashboard - Blog</title></svelte:head>

<div class="max-w-5xl mx-auto">
  <!-- Header -->
  <div class="flex items-center justify-between mb-8">
    <div>
      <h1 class="text-h1">Dashboard</h1>
      {#if currentUser}
        <p class="text-secondary mt-1">Welcome back, <span class="text-primary font-medium">{currentUser.username}</span></p>
      {/if}
    </div>
    <a href="/posts/create" class="btn-primary">+ New Post</a>
  </div>

  <!-- Stats Cards -->
  <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
    <div class="bg-card border border-default rounded-xl p-5">
      <p class="text-muted text-small mb-1">Total Posts</p>
      <p class="text-3xl font-bold text-primary">{pagination?.total ?? posts.length}</p>
    </div>
    <div class="bg-card border border-default rounded-xl p-5">
      <p class="text-muted text-small mb-1">Published</p>
      <p class="text-3xl font-bold text-success">{publishedCount}</p>
    </div>
    <div class="bg-card border border-default rounded-xl p-5">
      <p class="text-muted text-small mb-1">Drafts</p>
      <p class="text-3xl font-bold text-secondary">{draftCount}</p>
    </div>
    <div class="bg-card border border-default rounded-xl p-5">
      <p class="text-muted text-small mb-1">Total Views</p>
      <p class="text-3xl font-bold text-brand">{totalViews}</p>
    </div>
  </div>

  <!-- Tabs -->
  <div class="flex gap-1 mb-6 border-b border-default">
    {#each [['all', 'All Posts'], ['published', 'Published'], ['draft', 'Drafts']] as [tab, label]}
      <button
        onclick={() => selectTab(tab as 'all' | 'published' | 'draft')}
        class="px-4 py-2 text-small font-medium transition-colors border-b-2 -mb-px {activeTab === tab
          ? 'border-brand text-brand'
          : 'border-transparent text-secondary hover:text-primary'}">
        {label}
      </button>
    {/each}
  </div>

  <!-- Posts List -->
  {#if loading}
    <div class="space-y-3">
      {#each Array(5) as _}
        <div class="bg-card border border-default rounded-xl p-4 animate-pulse">
          <div class="flex items-center gap-4">
            <div class="w-16 h-16 bg-bg-tertiary rounded-lg flex-shrink-0"></div>
            <div class="flex-1 space-y-2">
              <div class="h-4 bg-bg-tertiary rounded w-2/3"></div>
              <div class="h-3 bg-bg-tertiary rounded w-1/3"></div>
            </div>
          </div>
        </div>
      {/each}
    </div>
  {:else if posts.length === 0}
    <div class="text-center py-20 bg-card border border-default rounded-xl">
      <p class="text-h3 text-secondary mb-3">No posts yet</p>
      <p class="text-secondary mb-6">Start writing and share your ideas with the world.</p>
      <a href="/posts/create" class="btn-primary">Write your first post</a>
    </div>
  {:else}
    <div class="space-y-3">
      {#each posts as post (post.id)}
        <div class="bg-card border border-default rounded-xl p-4 hover:border-brand transition-colors group">
          <div class="flex items-center gap-4">
            <!-- Thumbnail -->
            {#if buildImageUrl(post.cover_image)}
              <img src={buildImageUrl(post.cover_image) || ''} alt={post.title}
                class="w-16 h-16 object-cover rounded-lg flex-shrink-0" />
            {:else}
              <div class="w-16 h-16 rounded-lg flex-shrink-0 bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center">
                <span class="text-white text-xl">✍️</span>
              </div>
            {/if}

            <!-- Info -->
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2 mb-1">
                <h3 class="font-semibold text-primary truncate group-hover:text-brand transition-colors">
                  {post.title}
                </h3>
                <span class="flex-shrink-0 px-2 py-0.5 rounded-full text-xs font-medium {post.status === 'published'
                  ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                  : 'bg-bg-tertiary text-secondary'}">
                  {post.status}
                </span>
              </div>
              <div class="flex items-center gap-4 text-xs text-muted">
                <span>{formatDate(post.published_at || post.created_at)}</span>
                <span>👁 {post.view_count} views</span>
                {#if post.tags?.length}
                  <span>🏷 {post.tags.slice(0, 3).join(', ')}{post.tags.length > 3 ? '...' : ''}</span>
                {/if}
              </div>
            </div>

            <!-- Actions -->
            <div class="flex items-center gap-2 flex-shrink-0">
              <a href="/posts/{post.slug}" class="text-xs text-secondary hover:text-primary transition-colors px-2 py-1 rounded hover:bg-bg-secondary">
                View
              </a>
              <a href="/posts/{post.slug}/edit" class="text-xs text-brand hover:underline px-2 py-1 rounded hover:bg-bg-secondary transition-colors">
                Edit
              </a>
              <button
                onclick={() => handleDelete(post)}
                disabled={deletingId === post.id}
                class="text-xs text-error hover:text-red-700 px-2 py-1 rounded hover:bg-bg-secondary transition-colors disabled:opacity-40">
                {deletingId === post.id ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      {/each}
    </div>

    <!-- Pagination -->
    {#if pagination && pagination.totalPages > 1}
      <div class="flex items-center justify-center gap-2 mt-8">
        <button onclick={() => currentPage--}
          disabled={currentPage <= 1}
          class="px-4 py-2 rounded-lg border border-default text-small hover:bg-bg-secondary disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
          ← Prev
        </button>
        <span class="text-secondary text-small px-4">Page {pagination.page} of {pagination.totalPages}</span>
        <button onclick={() => currentPage++}
          disabled={currentPage >= pagination.totalPages}
          class="px-4 py-2 rounded-lg border border-default text-small hover:bg-bg-secondary disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
          Next →
        </button>
      </div>
    {/if}
  {/if}
</div>
