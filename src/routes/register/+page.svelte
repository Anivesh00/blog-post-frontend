<script lang="ts">
  import { register } from '$lib/stores/auth.svelte';
  import { ApiError } from '$lib/api/client';
  import { isValidEmail, isValidPassword, isValidUsername, VALIDATION } from '$lib/utils/validation';
  import { goto } from '$app/navigation';

  let email = $state('');
  let username = $state('');
  let password = $state('');
  let fullName = $state('');
  let loading = $state(false);
  let errorMsg = $state('');

  function getPasswordScore(pwd: string) {
    if (!pwd) return { score: 0, label: '', color: '' };
    let score = 0;
    if (pwd.length >= 8) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[a-z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[!@#$%^&*]/.test(pwd)) score++;
    const labels = ['', 'Weak', 'Fair', 'Good', 'Strong', 'Very Strong'];
    const colors = ['', 'bg-red-500', 'bg-orange-400', 'bg-yellow-400', 'bg-green-500', 'bg-green-600'];
    return { score, label: labels[score], color: colors[score] };
  }

  const strength = $derived(getPasswordScore(password));
  const emailError = $derived(email && !isValidEmail(email) ? 'Invalid email format' : '');
  const usernameError = $derived(username && !isValidUsername(username) ? 'Username: 3-30 chars, alphanumeric + underscore' : '');
  const passwordError = $derived(password && !isValidPassword(password) ? VALIDATION.password.message : '');

  async function handleSubmit(e: Event) {
    e.preventDefault();
    if (!isValidEmail(email)) { errorMsg = 'Invalid email'; return; }
    if (!isValidUsername(username)) { errorMsg = 'Invalid username'; return; }
    if (!isValidPassword(password)) { errorMsg = VALIDATION.password.message; return; }
    loading = true;
    errorMsg = '';
    try {
      await register({ email, username, password, full_name: fullName || undefined });
      await goto('/');
    } catch (err) {
      errorMsg = err instanceof ApiError ? err.message : 'Registration failed';
    } finally {
      loading = false;
    }
  }
</script>

<svelte:head><title>Register - Blog</title></svelte:head>

<div class="max-w-md mx-auto py-12">
  <div class="bg-card border border-default rounded-xl p-8 shadow-card">
    <h1 class="text-h1 mb-2">Create account</h1>
    <p class="text-secondary mb-8">Join the community</p>

    {#if errorMsg}
      <div class="mb-4 p-3 rounded-lg border border-error text-error text-small" style="background: var(--color-error-subtle)">
        {errorMsg}
      </div>
    {/if}

    <form onsubmit={handleSubmit} class="space-y-5">
      <div>
        <label class="block text-small font-medium mb-1" for="email">Email *</label>
        <input id="email" type="email" bind:value={email} required
          placeholder="you@example.com"
          class="input-base {emailError ? 'border-error' : ''}" />
        {#if emailError}<p class="text-xs text-error mt-1">{emailError}</p>{/if}
      </div>

      <div>
        <label class="block text-small font-medium mb-1" for="username">Username *</label>
        <input id="username" type="text" bind:value={username} required
          placeholder="john_doe"
          class="input-base {usernameError ? 'border-error' : ''}" />
        {#if usernameError}<p class="text-xs text-error mt-1">{usernameError}</p>{/if}
      </div>

      <div>
        <label class="block text-small font-medium mb-1" for="fullname">Full Name</label>
        <input id="fullname" type="text" bind:value={fullName}
          placeholder="John Doe" class="input-base" />
      </div>

      <div>
        <label class="block text-small font-medium mb-1" for="password">Password *</label>
        <input id="password" type="password" bind:value={password} required
          placeholder="Min 8 chars with uppercase, number & special char"
          class="input-base {passwordError ? 'border-error' : ''}" />
        {#if password}
          <div class="mt-2 space-y-1">
            <div class="flex gap-1">
              {#each Array(5) as _, i}
                <div class="h-1 flex-1 rounded-full {i < strength.score ? strength.color : 'bg-bg-tertiary'}"></div>
              {/each}
            </div>
            {#if strength.label}<p class="text-xs text-secondary">{strength.label}</p>{/if}
          </div>
        {/if}
        {#if passwordError}<p class="text-xs text-error mt-1">{passwordError}</p>{/if}
      </div>

      <button type="submit" disabled={loading}
        class="w-full btn-primary py-3 {loading ? 'opacity-60 cursor-not-allowed' : ''}">
        {loading ? 'Creating account...' : 'Create Account'}
      </button>
    </form>

    <p class="text-center text-secondary text-small mt-6">
      Already have an account? <a href="/login" class="text-brand hover:underline">Sign in</a>
    </p>
  </div>
</div>
