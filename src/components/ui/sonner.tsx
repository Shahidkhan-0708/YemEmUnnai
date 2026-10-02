import React from 'react';
import { Toaster as SonnerToaster } from 'sonner';

type ToasterProps = React.ComponentProps<typeof SonnerToaster>;

export const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <SonnerToaster
      position="bottom-center"
      toastOptions={{
        classNames: {
          toast:
            'group toast font-sans rounded-2xl bg-[#1E293B] text-white border border-white/10 shadow-2xl p-4 text-xs font-bold flex items-center gap-3',
          description: 'text-slate-300 font-medium text-[11px]',
          actionButton:
            'bg-[#F06A05] text-white hover:bg-[#D85800] rounded-xl px-3 py-1 text-xs font-bold btn-orange-shadow',
          cancelButton:
            'bg-slate-700 text-white hover:bg-slate-600 rounded-xl px-3 py-1 text-xs font-bold',
          success: 'text-emerald-400',
          error: 'text-rose-400',
          info: 'text-amber-400',
        },
        style: {
          zIndex: 99999,
        },
      }}
      {...props}
    />
  );
};

export { toast } from 'sonner';
