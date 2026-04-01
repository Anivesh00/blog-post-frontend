<script lang="ts">
  import { getTheme, toggleTheme } from '$lib/stores/theme.svelte';

  let currentTheme = $state('light');

  $effect(() => {
    currentTheme = getTheme();
  });
</script>

<button
  onclick={() => {
    toggleTheme();
    currentTheme = getTheme();
  }}
  class="p-2 rounded-lg hover:bg-bg-secondary transition-colors"
  aria-label="Toggle theme"
>
  {currentTheme === 'light' ? '🌙' : '☀️'}
</button>
