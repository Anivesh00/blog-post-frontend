<script lang="ts">
  import { login } from '$lib/stores/auth.svelte';
  import { ApiError } from '$lib/api/client';
  import { isValidEmail } from '$lib/utils/validation';
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';

  let email = $state('');
  let password = $state('');
  let loading = $state(false);
  let errorMsg = $state('');

  const emailError = $derived(email && !isValidEmail(email) ? 'Invalid email format' : '');

  async function handleSubmit(e: Event) {
    e.preventDefault();
    if (!email || !password) { errorMsg = 'Please fill all fields'; return; }
    if (!isValidEmail(email)) { errorMsg = 'Invalid email'; return; }
    loading = true;
    errorMsg = '';
    try {
      await login({ email, password });
      const next = $page.url.searchParams.get('next') || '/';
      await goto(next);
    } catch (err) {
      errorMsg = err instanceof ApiError ? err.message : 'Login failed';
    } finally {
      loading = false;
    }
  }
</script>

<svelte:head><title>Login - Blog</title></svelte:head>

<div class="max-w-md mx-auto py-12">
  <div class="bg-card border border-default rounded-xl p-8 shadow-card">
    <h1 class="text-h1 mb-2">Welcome back</h1>
    <p class="text-secondary mb-8">Sign in to your account</p>

    {#if errorMsg}
      <div class="mb-4 p-3 rounded-lg border border-error text-error text-small" style="background: var(--color-error-subtle)">
        {errorMsg}
      </div>
    {/if}

    <form onsubmit={handleSubmit} class="space-y-5">
      <div>
        <label class="block text-small font-medium mb-1" for="email">Email</label>
        <input id="email" type="email" bind:value={email} required
          placeholder="you@example.com"
          class="input-base {emailError ? 'border-error' : ''}" />
        {#if emailError}<p class="text-xs text-error mt-1">{emailError}</p>{/if}
      </div>

      <div>
        <label class="block text-small font-medium mb-1" for="password">Password</label>
        <input id="password" type="password" bind:value={password} required
          placeholder="Your password" class="input-base" />
      </div>

      <button type="submit" disabled={loading}
        class="w-full btn-primary py-3 {loading ? 'opacity-60 cursor-not-allowed' : ''}">
        {loading ? 'Signing in...' : 'Sign In'}
      </button>
    </form>

    <p class="text-center text-secondary text-small mt-6">
      Don't have an account? <a href="/register" class="text-brand hover:underline">Register</a>
    </p>
  </div>
</div>
