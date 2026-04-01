import { redirect } from '@sveltejs/kit';
import { getIsAuthenticated } from '$lib/stores/auth.svelte';

export function requireAuth(next?: string): void {
  if (!getIsAuthenticated()) {
    const redirectTo = next ? `/login?next=${encodeURIComponent(next)}` : '/login';
    throw redirect(302, redirectTo);
  }
}
