<script lang="ts">
  import { page } from '$app/stores';
  import { getPostApi } from '$lib/api/posts';
  import { listCommentsApi, createCommentApi, updateCommentApi, deleteCommentApi } from '$lib/api/comments';
  import { buildImageUrl } from '$lib/utils/s3';
  import { formatDateLong, formatDate, readingTime } from '$lib/utils/format';
  import { authState } from '$lib/stores/auth.svelte';
  import { success, error as toastError } from '$lib/stores/toast.svelte';
  import { ApiError } from '$lib/api/client';
  import type { Post, Comment } from '$lib/api/types';

  let post = $state<Post | null>(null);
  let comments = $state<Comment[]>([]);
  let loading = $state(true);
  let commentLoading = $state(false);
  let newComment = $state('');
  let replyTo = $state<string | null>(null);
  let replyContent = $state('');
  let editingId = $state<string | null>(null);
  let editContent = $state('');

  const slug = $derived($page.params.slug);

  $effect(() => {
    loadPost(slug);
  });

  async function loadPost(s: string) {
    loading = true;
    try {
      const res = await getPostApi(s);
      post = res.post;
      await loadComments();
    } catch {
      post = null;
    } finally {
      loading = false;
    }
  }

  async function loadComments() {
    if (!post) return;
    const res = await listCommentsApi(post.id);
    comments = res.comments;
  }

  async function submitComment(parentId: string | null = null) {
    if (!post) return;
    const content = parentId ? replyContent : newComment;
    if (!content.trim()) return;
    commentLoading = true;
    try {
      await createCommentApi(post.id, { content: content.trim(), parent_id: parentId });
      if (parentId) { replyContent = ''; replyTo = null; }
      else newComment = '';
      await loadComments();
      success('Comment posted!');
    } catch (err) {
      toastError(err instanceof ApiError ? err.message : 'Failed to post comment');
    } finally {
      commentLoading = false;
    }
  }

  async function saveEdit(commentId: string) {
    if (!post || !editContent.trim()) return;
    try {
      await updateCommentApi(post.id, commentId, { content: editContent.trim() });
      editingId = null;
      editContent = '';
      await loadComments();
      success('Comment updated!');
    } catch (err) {
      toastError(err instanceof ApiError ? err.message : 'Failed to update comment');
    }
  }

  async function deleteComment(commentId: string) {
    if (!post || !confirm('Delete this comment?')) return;
    try {
      await deleteCommentApi(post.id, commentId);
      await loadComments();
      success('Comment deleted');
    } catch (err) {
      toastError(err instanceof ApiError ? err.message : 'Failed to delete comment');
    }
  }

  function startEdit(comment: Comment) {
    editingId = comment.id;
    editContent = comment.content;
    replyTo = null;
  }

  const currentUser = $derived(authState.user);
  const isAuth = $derived(!!authState.user && !!authState.accessToken);
</script>

<svelte:head>
  <title>{post?.title || 'Loading...'} - Blog</title>
  {#if post?.excerpt}<meta name="description" content={post.excerpt} />{/if}
</svelte:head>

{#if loading}
  <div class="max-w-3xl mx-auto">
    <div class="animate-pulse space-y-4 mb-8">
      <div class="h-8 bg-bg-tertiary rounded w-3/4"></div>
      <div class="h-4 bg-bg-tertiary rounded w-1/2"></div>
      <div class="h-64 bg-bg-tertiary rounded-xl"></div>
    </div>
  </div>
{:else if !post}
  <div class="text-center py-20">
    <h1 class="text-h1 mb-4">Post not found</h1>
    <a href="/" class="btn-primary">Go Home</a>
  </div>
{:else}
  <article class="max-w-3xl mx-auto">
    <!-- Tags -->
    {#if post.tags?.length}
      <div class="flex flex-wrap gap-2 mb-4">
        {#each post.tags as tag}
          <span class="px-3 py-1 rounded-full text-small font-medium" style="background: var(--color-brand-subtle); color: var(--color-brand)">
            #{tag}
          </span>
        {/each}
      </div>
    {/if}

    <!-- Title -->
    <h1 class="text-display mb-4">{post.title}</h1>

    <!-- Meta -->
    <div class="flex items-center gap-4 text-small text-secondary mb-8 pb-8 border-b border-default">
      <div class="flex items-center gap-2">
        <div class="w-8 h-8 rounded-full bg-brand flex items-center justify-center text-white font-bold">
          {(post.author_username || 'U')[0].toUpperCase()}
        </div>
        <span class="font-medium text-primary">{post.author_username}</span>
      </div>
      <span>·</span>
      <span>{formatDateLong(post.published_at || post.created_at)}</span>
      <span>·</span>
      <span>{readingTime(post.content || '')}</span>
      <span>·</span>
      <span>👁 {post.view_count} views</span>
      {#if currentUser?.id === post.author_id || currentUser?.role === 'admin'}
        <span>·</span>
        <a href="/posts/{post.slug}/edit" class="text-brand hover:underline">Edit</a>
      {/if}
    </div>

    <!-- Cover Image -->
    {#if buildImageUrl(post.cover_image)}
      <img src={buildImageUrl(post.cover_image) || ''} alt={post.title}
        class="w-full h-80 object-cover rounded-xl mb-8" />
    {/if}

    <!-- Content -->
    <div class="prose prose-lg max-w-none text-primary leading-relaxed space-y-4 mb-12">
      {#each (post.content || '').split('\n') as paragraph}
        {#if paragraph.trim()}
          <p>{paragraph}</p>
        {/if}
      {/each}
    </div>

    <!-- Comments Section -->
    <div class="border-t border-default pt-12">
      <h2 class="text-h2 mb-8">Comments ({comments.length})</h2>

      <!-- Add Comment -->
      {#if isAuth}
        <div class="mb-8 bg-card border border-default rounded-xl p-5">
          <p class="text-small font-medium mb-3">Add a comment</p>
          <textarea bind:value={newComment} rows="3"
            placeholder="Share your thoughts..."
            class="input-base resize-none mb-3"></textarea>
          <button onclick={() => submitComment(null)} disabled={commentLoading || !newComment.trim()}
            class="btn-primary {commentLoading || !newComment.trim() ? 'opacity-60 cursor-not-allowed' : ''}">
            {commentLoading ? 'Posting...' : 'Post Comment'}
          </button>
        </div>
      {:else}
        <div class="mb-8 p-5 bg-card border border-default rounded-xl text-center">
          <p class="text-secondary mb-3">Join the conversation</p>
          <a href="/login" class="btn-primary">Sign in to comment</a>
        </div>
      {/if}

      <!-- Comment List -->
      {#if comments.length === 0}
        <p class="text-secondary text-center py-8">No comments yet. Be the first!</p>
      {:else}
        <div class="space-y-4">
          {#each comments as comment (comment.id)}
            {@render CommentItem(comment, 0)}
          {/each}
        </div>
      {/if}
    </div>
  </article>
{/if}

{#snippet CommentItem(comment: Comment, depth: number)}
  <div class="bg-card border border-default rounded-xl p-5 {depth > 0 ? 'ml-8 border-l-2 border-l-brand' : ''}">
    <div class="flex items-center justify-between mb-3">
      <div class="flex items-center gap-2">
        <div class="w-7 h-7 rounded-full bg-brand flex items-center justify-center text-white text-xs font-bold">
          {(comment.author_username || 'U')[0].toUpperCase()}
        </div>
        <span class="font-medium text-small">{comment.author_username}</span>
        <span class="text-muted text-xs">· {formatDate(comment.created_at)}</span>
      </div>
      {#if isAuth && currentUser && (currentUser.id === comment.author_id || currentUser.role === 'admin')}
        <div class="flex gap-2">
          <button onclick={() => startEdit(comment)} class="text-xs text-secondary hover:text-primary">Edit</button>
          <button onclick={() => deleteComment(comment.id)} class="text-xs text-error hover:text-red-700">Delete</button>
        </div>
      {/if}
    </div>

    {#if editingId === comment.id}
      <div class="space-y-2">
        <textarea bind:value={editContent} rows="3" class="input-base resize-none text-small"></textarea>
        <div class="flex gap-2">
          <button onclick={() => saveEdit(comment.id)} class="btn-primary text-small px-3 py-1.5">Save</button>
          <button onclick={() => { editingId = null; editContent = ''; }} class="btn-secondary text-small px-3 py-1.5">Cancel</button>
        </div>
      </div>
    {:else}
      <p class="text-small text-primary leading-relaxed">{comment.content}</p>
      {#if isAuth && depth < 3}
        <button onclick={() => { replyTo = comment.id; replyContent = ''; }}
          class="mt-2 text-xs text-secondary hover:text-brand transition-colors">
          ↩ Reply
        </button>
      {/if}
    {/if}

    <!-- Reply Form -->
    {#if replyTo === comment.id}
      <div class="mt-3 space-y-2">
        <textarea bind:value={replyContent} rows="2" placeholder="Write a reply..."
          class="input-base resize-none text-small"></textarea>
        <div class="flex gap-2">
          <button onclick={() => submitComment(comment.id)} disabled={!replyContent.trim()}
            class="btn-primary text-small px-3 py-1.5 {!replyContent.trim() ? 'opacity-60 cursor-not-allowed' : ''}">
            Reply
          </button>
          <button onclick={() => { replyTo = null; replyContent = ''; }} class="btn-secondary text-small px-3 py-1.5">Cancel</button>
        </div>
      </div>
    {/if}

    <!-- Nested Replies -->
    {#if comment.childComments?.length}
      <div class="mt-4 space-y-3">
        {#each comment.childComments as child (child.id)}
          {@render CommentItem(child, depth + 1)}
        {/each}
      </div>
    {/if}
  </div>
{/snippet}
