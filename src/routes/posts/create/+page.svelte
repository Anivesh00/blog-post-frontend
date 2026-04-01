<script lang="ts">
  import { createPostApi } from '$lib/api/posts';
  import { getPresignedUrlApi, uploadToS3 } from '$lib/api/media';
  import { authState } from '$lib/stores/auth.svelte';
  import { success, error as toastError } from '$lib/stores/toast.svelte';
  import { ApiError } from '$lib/api/client';
  import { isValidTitle, isValidContent, isValidExcerpt } from '$lib/utils/validation';
  import { goto } from '$app/navigation';
  import { onMount } from 'svelte';

  let title = $state('');
  let content = $state('');
  let excerpt = $state('');
  let status = $state<'draft' | 'published'>('draft');
  let tagInput = $state('');
  let tags = $state<string[]>([]);
  let coverFile = $state<File | null>(null);
  let coverPreview = $state<string | null>(null);
  let uploading = $state(false);
  let saving = $state(false);
  let showPreview = $state(false);
  let errorMsg = $state('');

  const titleError = $derived(title && !isValidTitle(title) ? 'Title must be 5-200 chars' : '');
  const contentError = $derived(content && !isValidContent(content) ? 'Content must be 10-10000 chars' : '');
  const excerptError = $derived(excerpt && !isValidExcerpt(excerpt) ? 'Excerpt max 500 chars' : '');

  onMount(() => {
    if (!authState.user || !authState.accessToken) goto('/login?next=/posts/create');
  });

  function addTag() {
    const t = tagInput.trim().toLowerCase();
    if (t && !tags.includes(t) && tags.length < 10) {
      tags = [...tags, t];
      tagInput = '';
    }
  }

  function removeTag(t: string) {
    tags = tags.filter(tag => tag !== t);
  }

  function handleTagKey(e: KeyboardEvent) {
    if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); addTag(); }
  }

  function handleFileChange(e: Event) {
    const input = e.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { toastError('Only images are allowed'); return; }
    coverFile = file;
    coverPreview = URL.createObjectURL(file);
  }

  async function handleSubmit() {
    if (!title.trim() || !content.trim()) { errorMsg = 'Title and content are required'; return; }
    if (!isValidTitle(title)) { errorMsg = 'Title must be 5-200 chars'; return; }
    if (!isValidContent(content)) { errorMsg = 'Content must be 10-10000 chars'; return; }
    if (excerpt && !isValidExcerpt(excerpt)) { errorMsg = 'Excerpt max 500 chars'; return; }

    saving = true;
    errorMsg = '';
    let coverKey: string | undefined;

    try {
      if (coverFile) {
        uploading = true;
        const { presignedUrl, key } = await getPresignedUrlApi({
          fileName: coverFile.name,
          contentType: coverFile.type
        });
        await uploadToS3(presignedUrl, coverFile);
        coverKey = key;
        uploading = false;
      }

      const res = await createPostApi({
        title: title.trim(),
        content: content.trim(),
        excerpt: excerpt.trim() || undefined,
        cover_image: coverKey,
        status,
        tags: tags.length ? tags : undefined
      });

      success('Post created!');
      await goto(`/posts/${res.post.slug}`);
    } catch (err) {
      uploading = false;
      errorMsg = err instanceof ApiError ? err.message : 'Failed to create post';
    } finally {
      saving = false;
    }
  }
</script>

<svelte:head><title>Create Post - Blog</title></svelte:head>

<div class="max-w-3xl mx-auto">
  <div class="flex items-center justify-between mb-8">
    <h1 class="text-h1">New Post</h1>
    <div class="flex items-center gap-3">
      <button onclick={() => showPreview = !showPreview}
        class="btn-secondary text-small">
        {showPreview ? '✏️ Edit' : '👁 Preview'}
      </button>
      <select bind:value={status}
        class="input-base w-auto px-3 py-2 text-small">
        <option value="draft">Draft</option>
        <option value="published">Published</option>
      </select>
      <button onclick={handleSubmit} disabled={saving}
        class="btn-primary {saving ? 'opacity-60 cursor-not-allowed' : ''}">
        {#if uploading}Uploading...{:else if saving}Saving...{:else}Save Post{/if}
      </button>
    </div>
  </div>

  {#if errorMsg}
    <div class="mb-4 p-3 rounded-lg border border-error text-error text-small" style="background: var(--color-error-subtle)">
      {errorMsg}
    </div>
  {/if}

  {#if showPreview}
    <!-- Preview Mode -->
    <div class="bg-card border border-default rounded-xl p-8">
      {#if coverPreview}
        <img src={coverPreview} alt="Cover" class="w-full h-64 object-cover rounded-lg mb-6" />
      {/if}
      {#if tags.length}
        <div class="flex gap-2 mb-4">
          {#each tags as tag}
            <span class="px-2 py-0.5 rounded-full text-xs" style="background: var(--color-brand-subtle); color: var(--color-brand)">#{tag}</span>
          {/each}
        </div>
      {/if}
      <h1 class="text-display mb-4">{title || 'Post Title'}</h1>
      {#if excerpt}<p class="text-secondary text-lg mb-6 italic">{excerpt}</p>{/if}
      <div class="prose prose-lg max-w-none text-primary leading-relaxed space-y-4">
        {#each (content || '').split('\n') as paragraph}
          {#if paragraph.trim()}<p>{paragraph}</p>{/if}
        {/each}
      </div>
    </div>
  {:else}
    <!-- Edit Mode -->
    <div class="space-y-6">
      <!-- Cover Image -->
      <div>
        <label class="block text-small font-medium mb-2">Cover Image</label>
        {#if coverPreview}
          <div class="relative mb-2">
            <img src={coverPreview} alt="Cover preview" class="w-full h-48 object-cover rounded-xl" />
            <button onclick={() => { coverFile = null; coverPreview = null; }}
              class="absolute top-2 right-2 bg-error text-white rounded-full w-7 h-7 flex items-center justify-center hover:bg-red-700 transition-colors text-sm">
              ✕
            </button>
          </div>
        {:else}
          <label class="flex flex-col items-center justify-center h-32 border-2 border-dashed border-default rounded-xl cursor-pointer hover:border-brand hover:bg-brand-subtle transition-colors">
            <span class="text-2xl mb-1">📸</span>
            <span class="text-small text-secondary">Click to upload cover image</span>
            <input type="file" accept="image/*" class="hidden" onchange={handleFileChange} />
          </label>
        {/if}
      </div>

      <!-- Title -->
      <div>
        <input bind:value={title} type="text"
          placeholder="Post title..."
          class="w-full text-3xl font-bold bg-transparent border-b-2 border-default focus:border-brand outline-none py-3 text-primary placeholder-muted transition-colors" />
        {#if titleError}<p class="text-xs text-error mt-1">{titleError}</p>{/if}
      </div>

      <!-- Excerpt -->
      <div>
        <label class="block text-small font-medium mb-1">Excerpt <span class="text-muted">(optional)</span></label>
        <input bind:value={excerpt} type="text"
          placeholder="Brief summary shown in post list..."
          class="input-base" />
        {#if excerptError}<p class="text-xs text-error mt-1">{excerptError}</p>{/if}
      </div>

      <!-- Content -->
      <div>
        <label class="block text-small font-medium mb-1">Content</label>
        <textarea bind:value={content} rows="20"
          placeholder="Write your post content here..."
          class="input-base resize-none font-mono text-small"></textarea>
        <p class="text-xs text-muted mt-1">{content.length} / 10000 chars</p>
        {#if contentError}<p class="text-xs text-error mt-1">{contentError}</p>{/if}
      </div>

      <!-- Tags -->
      <div>
        <label class="block text-small font-medium mb-2">Tags <span class="text-muted">(max 10)</span></label>
        <div class="flex flex-wrap gap-2 mb-2">
          {#each tags as tag}
            <span class="flex items-center gap-1 px-2 py-1 rounded-full text-xs" style="background: var(--color-brand-subtle); color: var(--color-brand)">
              #{tag}
              <button onclick={() => removeTag(tag)} class="hover:text-red-500 transition-colors">✕</button>
            </span>
          {/each}
        </div>
        <div class="flex gap-2">
          <input bind:value={tagInput} type="text"
            placeholder="Add tag (press Enter)"
            onkeydown={handleTagKey}
            class="input-base flex-1" />
          <button onclick={addTag} class="btn-secondary px-4">Add</button>
        </div>
      </div>
    </div>
  {/if}
</div>
