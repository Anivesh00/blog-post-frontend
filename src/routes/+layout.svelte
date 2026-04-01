<script lang="ts">
  import { onMount } from 'svelte';
  import { initializeAuth } from '$lib/stores/auth.svelte';
  import { initializeTheme } from '$lib/stores/theme.svelte';
  import { getToasts } from '$lib/stores/toast.svelte';
  import Navbar from '$lib/components/layout/Navbar.svelte';
  import '$lib/api/client';
  import '../app.css';

  let toastList = $state<any[]>([]);

  onMount(async () => {
    initializeTheme();
    await initializeAuth();
  });

  $effect(() => {
    toastList = getToasts();
  });
</script>

<svelte:head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Blog - Share Your Ideas</title>
</svelte:head>

<div class="min-h-screen flex flex-col bg-primary text-primary">
  <Navbar />

  <main class="flex-1 max-w-6xl mx-auto w-full px-4 py-8">
    <slot />
  </main>

  <footer class="bg-secondary border-t border-default mt-12">
    <div class="max-w-6xl mx-auto px-4 py-8 text-center text-small text-secondary">
      <p>&copy; 2026 Serverless Blog. All rights reserved.</p>
    </div>
  </footer>

  <!-- Toast Notifications -->
  <div class="fixed bottom-4 right-4 space-y-2 max-w-sm">
    {#each toastList as toast (toast.id)}
      <div
        class={`p-4 rounded-lg shadow-lg text-white animate-in fade-in slide-in-from-right ${
          toast.type === 'success' ? 'bg-success' : toast.type === 'error' ? 'bg-error' : 'bg-brand'
        }`}
      >
        {toast.message}
      </div>
    {/each}
  </div>
</div>

<style global>
  html {
    scroll-behavior: smooth;
  }
</style>
