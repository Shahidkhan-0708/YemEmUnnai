import React, { createContext, useContext, useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { cn } from '../../lib/utils';
import { playTapSound } from '../../lib/celebration';

interface DialogContextType {
  open: boolean;
  setOpen: (open: boolean) => void;
}

const DialogContext = createContext<DialogContextType | null>(null);

export interface DialogProps {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  children: React.ReactNode;
}

export const Dialog: React.FC<DialogProps> = ({
  open: controlledOpen,
  defaultOpen = false,
  onOpenChange,
  children,
}) => {
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(defaultOpen);
  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : uncontrolledOpen;

  const setOpen = React.useCallback(
    (next: boolean) => {
      if (!isControlled) {
        setUncontrolledOpen(next);
      }
      onOpenChange?.(next);
    },
    [isControlled, onOpenChange]
  );

  return (
    <DialogContext.Provider value={{ open, setOpen }}>
      {children}
    </DialogContext.Provider>
  );
};

export interface DialogTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
}

export const DialogTrigger = React.forwardRef<HTMLButtonElement, DialogTriggerProps>(
  ({ asChild, children, onClick, ...props }, ref) => {
    const ctx = useContext(DialogContext);
    if (!ctx) throw new Error('DialogTrigger must be used within Dialog');

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      playTapSound();
      onClick?.(e);
      ctx.setOpen(true);
    };

    if (asChild && React.isValidElement(children)) {
      return React.cloneElement(children as React.ReactElement<any>, {
        onClick: (e: React.MouseEvent<HTMLButtonElement>) => {
          handleClick(e);
          (children as any).props?.onClick?.(e);
        },
      });
    }

    return (
      <button ref={ref} type="button" onClick={handleClick} {...props}>
        {children}
      </button>
    );
  }
);
DialogTrigger.displayName = 'DialogTrigger';

export interface DialogContentProps extends React.HTMLAttributes<HTMLDivElement> {
  showClose?: boolean;
}

export const DialogContent = React.forwardRef<HTMLDivElement, DialogContentProps>(
  ({ className, children, showClose = true, ...props }, forwardedRef) => {
    const ctx = useContext(DialogContext);
    const contentRef = useRef<HTMLDivElement>(null);

    React.useImperativeHandle(forwardedRef, () => contentRef.current as HTMLDivElement);

    useEffect(() => {
      if (!ctx?.open) return;

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          playTapSound();
          ctx.setOpen(false);
        }
      };

      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }, [ctx]);

    if (!ctx?.open) return null;

    return (
      <div
        role="dialog"
        aria-modal="true"
        className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            playTapSound();
            ctx.setOpen(false);
          }
        }}
      >
        <div
          ref={contentRef}
          className={cn(
            'w-full max-w-sm rounded-[32px] bg-[#E8ECEF] p-6 shadow-2xl border border-white/70 tactile-modal animate-in zoom-in-95 duration-200 relative overflow-hidden font-sans',
            className
          )}
          {...props}
        >
          {showClose && (
            <button
              type="button"
              onClick={() => {
                playTapSound();
                ctx.setOpen(false);
              }}
              aria-label="Close dialog"
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-[#E8ECEF] border border-[#D6DCE2] flex items-center justify-center text-[#7A6658] hover:text-[#1F140A] active:scale-90 transition-transform cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          {children}
        </div>
      </div>
    );
  }
);
DialogContent.displayName = 'DialogContent';

export const DialogHeader: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className,
  ...props
}) => (
  <div className={cn('flex flex-col space-y-2 text-center sm:text-left', className)} {...props} />
);
DialogHeader.displayName = 'DialogHeader';

export const DialogFooter: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className,
  ...props
}) => (
  <div
    className={cn('flex flex-col-reverse sm:flex-row sm:justify-end gap-2 mt-6', className)}
    {...props}
  />
);
DialogFooter.displayName = 'DialogFooter';

export const DialogTitle: React.FC<React.HTMLAttributes<HTMLHeadingElement>> = ({
  className,
  ...props
}) => (
  <h3
    className={cn('text-lg font-extrabold text-[#1F140A] tracking-tight', className)}
    {...props}
  />
);
DialogTitle.displayName = 'DialogTitle';

export const DialogDescription: React.FC<React.HTMLAttributes<HTMLParagraphElement>> = ({
  className,
  ...props
}) => (
  <p
    className={cn('text-xs font-semibold text-[#7A6658] leading-relaxed', className)}
    {...props}
  />
);
DialogDescription.displayName = 'DialogDescription';
