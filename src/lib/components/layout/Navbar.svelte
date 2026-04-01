<script lang="ts">
  import { authState, logout } from '$lib/stores/auth.svelte';
  import ThemeToggle from './ThemeToggle.svelte';
  import { goto } from '$app/navigation';

  let menuOpen = $state(false);

  const isAuth = $derived(!!authState.user && !!authState.accessToken);
  const currentUser = $derived(authState.user);

  async function handleLogout() {
    await logout();
    await goto('/');
  }
</script>

<nav class="bg-primary border-b border-default sticky top-0 z-50">
  <div class="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
    <!-- Logo -->
    <a href="/" class="text-h3 font-bold text-brand">Blog</a>

    <!-- Desktop Menu -->
    <div class="hidden md:flex items-center gap-6">
      <a href="/" class="text-primary hover:text-brand transition-colors">Home</a>

      {#if isAuth}
        <a href="/dashboard" class="text-primary hover:text-brand transition-colors">Dashboard</a>
        <a href="/posts/create" class="btn-primary">Write</a>
        <div class="flex items-center gap-3 pl-6 border-l border-default">
          <span class="text-small text-secondary">{currentUser?.username}</span>
          <button onclick={handleLogout} class="text-small text-primary hover:text-error transition-colors">
            Logout
          </button>
        </div>
      {:else}
        <a href="/login" class="text-primary hover:text-brand transition-colors">Login</a>
        <a href="/register" class="btn-primary">Register</a>
      {/if}

      <ThemeToggle />
    </div>

    <!-- Mobile Menu Button -->
    <div class="md:hidden flex items-center gap-3">
      <ThemeToggle />
      <button onclick={() => (menuOpen = !menuOpen)} class="p-2">☰</button>
    </div>
  </div>

  <!-- Mobile Menu -->
  {#if menuOpen}
    <div class="md:hidden bg-secondary border-t border-default p-4 space-y-3">
      <a href="/" class="block text-primary hover:text-brand">Home</a>
      {#if isAuth}
        <a href="/dashboard" class="block text-primary hover:text-brand">Dashboard</a>
        <a href="/posts/create" class="block btn-primary">Write</a>
        <div class="pt-3 border-t border-default space-y-2">
          <p class="text-small text-secondary">{currentUser?.username}</p>
          <button onclick={handleLogout} class="block w-full text-left text-small text-error">
            Logout
          </button>
        </div>
      {:else}
        <a href="/login" class="block text-primary hover:text-brand">Login</a>
        <a href="/register" class="block btn-primary">Register</a>
      {/if}
    </div>
  {/if}
</nav>
