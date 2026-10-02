import * as React from 'react';
import { cn } from '@/lib/utils';

interface PopoverContextType {
  open: boolean;
  setOpen: (open: boolean) => void;
  triggerRef: React.RefObject<HTMLElement | null>;
}

const PopoverContext = React.createContext<PopoverContextType | undefined>(undefined);

export interface PopoverProps {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  children: React.ReactNode;
}

export const Popover: React.FC<PopoverProps> = ({
  open: controlledOpen,
  defaultOpen = false,
  onOpenChange,
  children,
}) => {
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(defaultOpen);
  const triggerRef = React.useRef<HTMLElement | null>(null);

  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : uncontrolledOpen;

  const setOpen = React.useCallback(
    (newOpen: boolean) => {
      if (!isControlled) {
        setUncontrolledOpen(newOpen);
      }
      onOpenChange?.(newOpen);
    },
    [isControlled, onOpenChange]
  );

  return (
    <PopoverContext.Provider value={{ open, setOpen, triggerRef }}>
      <div className="relative inline-block">{children}</div>
    </PopoverContext.Provider>
  );
};

export interface PopoverTriggerProps extends React.HTMLAttributes<HTMLElement> {
  asChild?: boolean;
}

export const PopoverTrigger = React.forwardRef<HTMLElement, PopoverTriggerProps>(
  ({ asChild = false, children, ...props }, forwardedRef) => {
    const context = React.useContext(PopoverContext);
    if (!context) throw new Error('PopoverTrigger must be used within Popover');

    const handleClick = (e: React.MouseEvent) => {
      e.stopPropagation();
      context.setOpen(!context.open);
    };

    const setRef = (node: HTMLElement | null) => {
      (context.triggerRef as React.MutableRefObject<HTMLElement | null>).current = node;
      if (typeof forwardedRef === 'function') {
        forwardedRef(node);
      } else if (forwardedRef) {
        (forwardedRef as React.MutableRefObject<HTMLElement | null>).current = node;
      }
    };

    if (asChild && React.isValidElement(children)) {
      return React.cloneElement(children as React.ReactElement<any>, {
        ref: setRef,
        'aria-expanded': context.open,
        'aria-haspopup': 'dialog',
        onClick: (e: React.MouseEvent) => {
          handleClick(e);
          (children as any).props?.onClick?.(e);
        },
        ...props,
      });
    }

    return (
      <button
        ref={setRef as any}
        type="button"
        aria-expanded={context.open}
        aria-haspopup="dialog"
        onClick={handleClick}
        {...props}
      >
        {children}
      </button>
    );
  }
);
PopoverTrigger.displayName = 'PopoverTrigger';

export interface PopoverContentProps extends React.HTMLAttributes<HTMLDivElement> {
  align?: 'start' | 'center' | 'end';
}

export const PopoverContent = React.forwardRef<HTMLDivElement, PopoverContentProps>(
  ({ className, align = 'center', children, ...props }, forwardedRef) => {
    const context = React.useContext(PopoverContext);
    const contentRef = React.useRef<HTMLDivElement>(null);

    React.useImperativeHandle(forwardedRef, () => contentRef.current as HTMLDivElement);

    React.useEffect(() => {
      if (!context?.open) return;

      const handleMouseDown = (e: MouseEvent) => {
        if (
          contentRef.current &&
          !contentRef.current.contains(e.target as Node) &&
          !context.triggerRef.current?.contains(e.target as Node)
        ) {
          context.setOpen(false);
          context.triggerRef.current?.focus();
        }
      };

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          context.setOpen(false);
          context.triggerRef.current?.focus();
        }
      };

      document.addEventListener('mousedown', handleMouseDown);
      window.addEventListener('keydown', handleKeyDown);

      // Viewport collision adjustment
      if (contentRef.current) {
        const rect = contentRef.current.getBoundingClientRect();
        if (rect.right > window.innerWidth - 8) {
          contentRef.current.style.right = '0';
          contentRef.current.style.left = 'auto';
          contentRef.current.style.transform = 'none';
        } else if (rect.left < 8) {
          contentRef.current.style.left = '0';
          contentRef.current.style.right = 'auto';
          contentRef.current.style.transform = 'none';
        }
      }

      return () => {
        document.removeEventListener('mousedown', handleMouseDown);
        window.removeEventListener('keydown', handleKeyDown);
      };
    }, [context]);

    if (!context?.open) return null;

    const alignClasses = {
      start: 'left-0',
      center: 'left-1/2 -translate-x-1/2',
      end: 'right-0',
    };

    return (
      <div
        ref={contentRef}
        role="dialog"
        tabIndex={-1}
        className={cn(
          'absolute top-full z-50 mt-2 shadow-2xl rounded-2xl border border-[#D6DCE2] bg-white p-5 animate-in fade-in zoom-in-95 duration-150 font-sans outline-none',
          alignClasses[align],
          className
        )}
        style={{
          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
        }}
        {...props}
      >
        {children}
      </div>
    );
  }
);
PopoverContent.displayName = 'PopoverContent';
