<script lang="ts">
  import { listPostsApi } from '$lib/api/posts';
  import { buildImageUrl } from '$lib/utils/s3';
  import { formatDate } from '$lib/utils/format';
  import type { Post, Pagination } from '$lib/api/types';

  let posts = $state<Post[]>([]);
  let pagination = $state<Pagination | null>(null);
  let loading = $state(true);
  let currentPage = $state(1);
  let selectedTag = $state('');
  const limit = 9;

  async function loadPosts() {
    loading = true;
    try {
      const res = await listPostsApi({ page: currentPage, limit, status: 'published', tag: selectedTag || undefined });
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
    selectedTag;
    loadPosts();
  });

  function selectTag(tag: string) {
    selectedTag = selectedTag === tag ? '' : tag;
    currentPage = 1;
  }

  const allTags = $derived([...new Set((posts ?? []).flatMap(p => p.tags || []))]);
</script>

<svelte:head><title>Blog - Share Your Ideas</title></svelte:head>

<!-- Hero -->
<div class="text-center py-16 mb-12 border-b border-default">
  <h1 class="text-display mb-4">Stories Worth Reading</h1>
  <p class="text-h3 text-secondary max-w-xl mx-auto">Discover insightful articles on technology, development, and more.</p>
</div>

<!-- Tag Filter -->
{#if allTags.length > 0}
  <div class="flex flex-wrap gap-2 mb-8">
    <button onclick={() => selectTag('')}
      class="px-3 py-1 rounded-full text-small font-medium transition-colors
        {selectedTag === '' ? 'bg-brand text-white' : 'bg-bg-secondary text-secondary hover:text-primary border border-default'}">
      All
    </button>
    {#each allTags as tag}
      <button onclick={() => selectTag(tag)}
        class="px-3 py-1 rounded-full text-small font-medium transition-colors
          {selectedTag === tag ? 'bg-brand text-white' : 'bg-bg-secondary text-secondary hover:text-primary border border-default'}">
        #{tag}
      </button>
    {/each}
  </div>
{/if}

<!-- Posts Grid -->
{#if loading}
  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    {#each Array(6) as _}
      <div class="bg-card border border-default rounded-xl overflow-hidden animate-pulse">
        <div class="h-48 bg-bg-tertiary"></div>
        <div class="p-5 space-y-3">
          <div class="h-4 bg-bg-tertiary rounded w-3/4"></div>
          <div class="h-3 bg-bg-tertiary rounded w-full"></div>
          <div class="h-3 bg-bg-tertiary rounded w-2/3"></div>
        </div>
      </div>
    {/each}
  </div>
{:else if !posts?.length}
  <div class="text-center py-20">
    <p class="text-h2 text-secondary mb-4">No posts yet</p>
    <p class="text-secondary mb-8">Be the first to write something amazing.</p>
    <a href="/register" class="btn-primary">Get Started</a>
  </div>
{:else}
  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    {#each posts as post (post.id)}
      <a href="/posts/{post.slug}" class="group bg-card border border-default rounded-xl overflow-hidden hover:shadow-lg transition-all hover:-translate-y-0.5">
        {#if buildImageUrl(post.cover_image)}
          <div class="h-48 overflow-hidden bg-bg-tertiary">
            <img src={buildImageUrl(post.cover_image) || ''} alt={post.title}
              class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
          </div>
        {:else}
          <div class="h-48 bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center">
            <span class="text-white text-4xl">✍️</span>
          </div>
        {/if}

        <div class="p-5">
          {#if post.tags?.length}
            <div class="flex flex-wrap gap-1 mb-3">
              {#each post.tags.slice(0, 3) as tag}
                <span class="px-2 py-0.5 rounded-full text-xs font-medium" style="background: var(--color-brand-subtle); color: var(--color-brand)">{tag}</span>
              {/each}
            </div>
          {/if}

          <h2 class="text-h3 mb-2 group-hover:text-brand transition-colors line-clamp-2">{post.title}</h2>

          {#if post.excerpt}
            <p class="text-secondary text-small mb-4 line-clamp-2">{post.excerpt}</p>
          {/if}

          <div class="flex items-center justify-between text-xs text-muted pt-3 border-t border-default">
            <div class="flex items-center gap-2">
              <div class="w-6 h-6 rounded-full bg-brand flex items-center justify-center text-white text-xs font-bold">
                {(post.author_username || 'U')[0].toUpperCase()}
              </div>
              <span>{post.author_username}</span>
            </div>
            <div class="flex items-center gap-3">
              <span>{formatDate(post.published_at || post.created_at)}</span>
              <span>👁 {post.view_count}</span>
            </div>
          </div>
        </div>
      </a>
    {/each}
  </div>

  {#if pagination && pagination.totalPages > 1}
    <div class="flex items-center justify-center gap-2 mt-12">
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
