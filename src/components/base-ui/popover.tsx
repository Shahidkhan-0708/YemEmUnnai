import * as React from 'react';
import { cn } from '@/lib/utils';

interface PopoverContextType {
  open: boolean;
  setOpen: (open: boolean) => void;
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
    <PopoverContext.Provider value={{ open, setOpen }}>
      <div className="relative inline-block">{children}</div>
    </PopoverContext.Provider>
  );
};

export interface PopoverTriggerProps extends React.HTMLAttributes<HTMLElement> {
  asChild?: boolean;
}

export const PopoverTrigger = React.forwardRef<HTMLElement, PopoverTriggerProps>(
  ({ asChild = false, children, ...props }, ref) => {
    const context = React.useContext(PopoverContext);
    if (!context) throw new Error('PopoverTrigger must be used within Popover');

    const handleClick = (e: React.MouseEvent) => {
      e.stopPropagation();
      context.setOpen(!context.open);
    };

    if (asChild && React.isValidElement(children)) {
      return React.cloneElement(children as React.ReactElement<any>, {
        onClick: (e: React.MouseEvent) => {
          handleClick(e);
          (children as any).props?.onClick?.(e);
        },
        ...props,
      });
    }

    return (
      <button ref={ref as any} type="button" onClick={handleClick} {...props}>
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
        if (contentRef.current && !contentRef.current.contains(e.target as Node)) {
          context.setOpen(false);
        }
      };

      document.addEventListener('mousedown', handleMouseDown);
      return () => document.removeEventListener('mousedown', handleMouseDown);
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
        className={cn(
          'absolute top-full z-50 mt-2 shadow-2xl rounded-2xl border border-[#D6DCE2] bg-white p-5 animate-in fade-in zoom-in-95 duration-150',
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
