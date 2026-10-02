import * as React from 'react';
import { cn } from '@/lib/utils';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon' | 'xs';
  asChild?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'default', asChild = false, children, ...props }, ref) => {
    const baseStyles =
      'inline-flex items-center justify-center whitespace-nowrap rounded-xl text-xs font-bold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 cursor-pointer active:scale-97 select-none';

    const variants: Record<string, string> = {
      default: 'bg-[#FE7200] text-white hover:bg-[#E05D00] btn-orange-shadow',
      destructive: 'bg-red-600 text-white hover:bg-red-700 shadow-sm',
      outline: 'border border-[#D6DCE2] bg-white text-[#1F140A] hover:bg-[#F4F6F8] shadow-xs',
      secondary: 'bg-[#DDE2E8] text-[#1F140A] hover:bg-[#D4DCE4]',
      ghost: 'hover:bg-black/5 text-[#1F140A]',
      link: 'text-[#FE7200] underline-offset-4 hover:underline',
    };

    const sizes: Record<string, string> = {
      default: 'h-9 px-4 py-2',
      xs: 'h-6 px-2.5 text-[9px]',
      sm: 'h-8 px-3 text-[10px]',
      lg: 'h-11 px-6 text-sm',
      icon: 'h-9 w-9 p-0',
    };

    const classes = cn(baseStyles, variants[variant], sizes[size], className);

    if (asChild && React.isValidElement(children)) {
      return React.cloneElement(children as React.ReactElement<any>, {
        className: cn(classes, (children as any).props?.className),
        ...props,
      });
    }

    return (
      <button ref={ref} className={classes} {...props}>
        {children}
      </button>
    );
  }
);
Button.displayName = 'Button';

export default Button;
