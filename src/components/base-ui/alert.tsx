import React from 'react';

export interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'destructive' | 'warning' | 'info';
}

export const Alert = React.forwardRef<HTMLDivElement, AlertProps>(
  ({ className = '', children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        role="alert"
        className={`relative w-full rounded-2xl border p-3.5 shadow-sm flex items-start gap-3 transition-all duration-200 bg-[#E8ECEF] border-[#D6DCE2] text-[#1F140A] ${className}`}
        style={{
          boxShadow: '-2px -2px 6px rgba(255,255,255,0.85), 3px 3px 7px rgba(163,174,187,0.35)',
        }}
        {...props}
      >
        {children}
      </div>
    );
  }
);
Alert.displayName = 'Alert';

export const AlertTitle = React.forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className = '', children, ...props }, ref) => (
    <h5
      ref={ref}
      className={`text-xs font-black tracking-tight text-[#1F140A] leading-tight ${className}`}
      {...props}
    >
      {children}
    </h5>
  )
);
AlertTitle.displayName = 'AlertTitle';

export const AlertDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className = '', children, ...props }, ref) => (
    <div
      ref={ref}
      className={`text-[11px] font-semibold text-[#7A6658] leading-snug mt-0.5 ${className}`}
      {...props}
    >
      {children}
    </div>
  )
);
AlertDescription.displayName = 'AlertDescription';
