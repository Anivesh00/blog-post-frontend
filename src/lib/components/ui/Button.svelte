<script lang="ts">
  type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';
  type Size = 'sm' | 'md' | 'lg';

  interface Props {
    variant?: Variant;
    size?: Size;
    loading?: boolean;
    disabled?: boolean;
    type?: 'button' | 'submit' | 'reset';
    onclick?: () => void;
    class?: string;
    children?: any;
  }

  let {
    variant = 'primary',
    size = 'md',
    loading = false,
    disabled = false,
    type = 'button',
    onclick,
    class: customClass = '',
    children
  }: Props = $props();

  const variantClass = {
    primary: 'btn-primary',
    secondary: 'btn-secondary',
    ghost: 'btn-ghost',
    danger: 'btn-danger'
  };

  const sizeClass = {
    sm: 'px-2 py-1 text-sm',
    md: 'px-4 py-2',
    lg: 'px-6 py-3 text-lg'
  };

  const baseClass = `${variantClass[variant]} ${sizeClass[size]} rounded-lg font-medium transition-colors`;
</script>

<button
  {type}
  disabled={disabled || loading}
  {onclick}
  class={`${baseClass} ${customClass} ${disabled || loading ? 'opacity-60 cursor-not-allowed' : ''}`}
>
  {#if loading}
    <span class="inline-block mr-2 animate-spin">⏳</span>
  {/if}
  <slot>{children}</slot>
</button>
