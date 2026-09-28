import * as React from 'react';
import { cn } from '../../lib/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'secondary' | 'destructive' | 'outline' | 'live' | 'warm';
}

export function Badge({ className, variant = 'default', ...props }: BadgeProps) {
  const base = 'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-wide transition-colors';

  const variants: Record<string, string> = {
    default: 'bg-[#09431B] text-white',
    secondary: 'bg-[#DDE2E8] text-[#0A2E20]',
    destructive: 'bg-red-500/20 text-red-700 border border-red-300',
    outline: 'border border-[#D6DCE2] text-[#5C7A6D]',
    live: 'bg-[#0A461E] text-[#A7F3D0] border border-[#10B981]/40 shadow-xs',
    warm: 'bg-gradient-to-r from-[#FF8A2A] to-[#F26A00] text-white shadow-xs'
  };

  return <div className={cn(base, variants[variant], className)} {...props} />;
}
