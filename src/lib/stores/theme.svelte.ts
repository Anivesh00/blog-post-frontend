type Theme = 'light' | 'dark';

let theme = $state<Theme>('light');

export function getTheme(): Theme {
  return theme;
}

export function initializeTheme(): void {
  if (typeof window === 'undefined') return;

  const savedTheme = localStorage.getItem('theme') as Theme | null;
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const resolved = savedTheme || (prefersDark ? 'dark' : 'light');

  theme = resolved;
  applyTheme(resolved);
}

function applyTheme(t: Theme): void {
  if (typeof window === 'undefined') return;
  const html = document.documentElement;
  if (t === 'dark') {
    html.classList.add('dark');
  } else {
    html.classList.remove('dark');
  }
}

export function toggleTheme(): Theme {
  theme = theme === 'light' ? 'dark' : 'light';
  applyTheme(theme);
  if (typeof window !== 'undefined') {
    localStorage.setItem('theme', theme);
  }
  return theme;
}
