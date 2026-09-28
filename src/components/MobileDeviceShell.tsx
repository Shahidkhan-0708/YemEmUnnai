import React from 'react';

interface MobileDeviceShellProps {
  children: React.ReactNode;
}

export const MobileDeviceShell: React.FC<MobileDeviceShellProps> = ({ children }) => {
  return (
    <div className="relative mx-auto w-full max-w-[400px] flex justify-center">
      {/* Device Frame — Realistic phone chassis */}
      <div className="w-full rounded-[48px] p-2.5 bg-gradient-to-b from-[#25392E] via-[#192720] to-[#121E18] shadow-[0_30px_70px_-10px_rgba(0,0,0,0.85),0_0_0_1px_rgba(52,211,153,0.3)] border border-[#2D4537] relative">
        {/* Dynamic Island / Speaker Pill */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 w-28 h-5 bg-[#080D0A] rounded-full flex items-center justify-between px-2.5 shadow-md border border-white/10 pointer-events-none">
          <div className="w-2.5 h-2.5 rounded-full bg-[#14231A] flex items-center justify-center">
            <div className="w-1 h-1 rounded-full bg-[#1C3A29]" />
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <div className="w-2 h-2 rounded-full bg-[#0F1A13]" />
          </div>
        </div>

        {/* Inner Screen Viewport */}
        <div className="rounded-[38px] overflow-hidden bg-[#E8ECEF] relative shadow-inner">
          {children}
        </div>

        {/* Home Indicator Bar */}
        <div className="w-32 h-1 bg-white/20 rounded-full mx-auto mt-2 mb-0.5" />
      </div>
    </div>
  );
};
