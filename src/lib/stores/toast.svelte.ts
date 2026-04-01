export interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
  duration?: number;
}

let toasts = $state<Toast[]>([]);

export function getToasts(): Toast[] {
  return toasts;
}

export function addToast(
  message: string,
  type: 'success' | 'error' | 'info' = 'info',
  duration = 4000
): string {
  const id = crypto.randomUUID();
  toasts = [...toasts, { id, message, type, duration }];

  if (duration > 0) {
    setTimeout(() => removeToast(id), duration);
  }

  return id;
}

export function removeToast(id: string): void {
  toasts = toasts.filter((t) => t.id !== id);
}

export function success(message: string, duration?: number): string {
  return addToast(message, 'success', duration);
}

export function error(message: string, duration?: number): string {
  return addToast(message, 'error', duration);
}

export function info(message: string, duration?: number): string {
  return addToast(message, 'info', duration);
}
