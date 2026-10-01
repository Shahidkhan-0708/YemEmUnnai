/**
 * Safe localStorage wrapper that gracefully handles private browsing,
 * iframe sandboxes, and Chrome storage partitioning where accessing
 * window.localStorage throws a SecurityError/DOMException.
 */
export const safeStorage = {
  getItem: (key: string): string | null => {
    try {
      if (typeof window === 'undefined') return null;
      return window.localStorage?.getItem(key) ?? null;
    } catch {
      return null;
    }
  },
  setItem: (key: string, value: string): void => {
    try {
      if (typeof window === 'undefined') return;
      window.localStorage?.setItem(key, value);
    } catch {
      // Silently ignore in restricted storage mode
    }
  },
  removeItem: (key: string): void => {
    try {
      if (typeof window === 'undefined') return;
      window.localStorage?.removeItem(key);
    } catch {
      // Silently ignore
    }
  },
};
