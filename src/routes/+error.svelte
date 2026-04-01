<script lang="ts">
  import { page } from '$app/stores';
</script>

<div class="max-w-2xl mx-auto py-12 text-center">
  <h1 class="text-display text-error mb-4">Oops!</h1>
  <p class="text-h2 mb-4">Something went wrong</p>
  
  {#if $page.status === 404}
    <p class="text-secondary mb-8">The page you're looking for doesn't exist.</p>
  {:else}
    <p class="text-secondary mb-8">An error occurred. Please try again later.</p>
  {/if}

  <a href="/" class="btn-primary inline-block">Go Home</a>
</div>
