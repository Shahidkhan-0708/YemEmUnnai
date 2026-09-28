import { useEffect, useRef } from 'react';

/**
 * Modal/sheet accessibility:
 *  - Escape closes (WCAG "escape routes" rule)
 *  - Tab cycles inside the dialog (focus trap)
 *  - Focus moves to the dialog on open, returns to the trigger on close
 *  - role="dialog" + aria-modal so screen readers announce it as one unit
 *
 * Usage:
 *   const ref = useModalA11y(isOpen, onClose);
 *   <div ref={ref} role="dialog" aria-modal="true" aria-label="Quick order">
 */
export function useModalA11y<T extends HTMLElement>(
  isOpen: boolean,
  onClose: () => void
) {
  const ref = useRef<T | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    const previouslyFocused = document.activeElement as HTMLElement | null;
    const root = ref.current;

    // Move focus into the dialog so SR/keyboard users land inside it
    const focusables = root?.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    focusables?.[0]?.focus();

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        onClose();
        return;
      }
      if (e.key === 'Tab' && root) {
        const items = Array.from(
          root.querySelectorAll<HTMLElement>(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
          )
        ).filter(el => !el.hasAttribute('disabled'));
        if (items.length === 0) return;
        const first = items[0];
        const last = items[items.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      previouslyFocused?.focus?.();
    };
  }, [isOpen, onClose]);

  return ref;
}
