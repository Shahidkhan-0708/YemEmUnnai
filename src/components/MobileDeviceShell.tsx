export interface ActiveOrderInfo {
  token: string;
  orderId?: string;
  vendor: string;
  status: string;
  stage?: 'sent' | 'preparing' | 'ready' | 'declined';
}

interface MobileDeviceShellProps {
  children: React.ReactNode;
  activeOrder?: ActiveOrderInfo | null;
  onClearActiveOrder?: () => void;
}

export const MobileDeviceShell: React.FC<MobileDeviceShellProps> = ({
  children,
  activeOrder,
  onClearActiveOrder,
}) => {
  const isReady = activeOrder?.stage === 'ready' || activeOrder?.status.toLowerCase().includes('ready');
  const isPrepping = activeOrder?.stage === 'preparing' || activeOrder?.status.toLowerCase().includes('prep');

  return (
    <div className="relative mx-auto w-full max-w-100 flex justify-center">
      {/* Device Frame — Realistic phone chassis */}
      <div className="w-full rounded-[48px] p-2.5 bg-linear-to-b from-[#241A14] via-[#18120E] to-[#100B08] shadow-[0_30px_70px_-10px_rgba(0,0,0,0.85),0_0_0_1px_rgba(52,211,153,0.3)] border border-[#2A1C14] relative">
        {/* Dynamic Island / Speaker Pill */}
        <div
          className={`absolute top-4 left-1/2 -translate-x-1/2 z-50 transition-all duration-300 ease-out rounded-full flex items-center shadow-lg ${
            activeOrder
              ? isReady
                ? 'w-71.25 h-8 px-3.5 justify-between cursor-pointer bg-linear-to-r from-[#F06A05] via-[#E05D00] to-[#C44E00] ring-2 ring-amber-400 border border-emerald-400 shadow-[0_0_22px_rgba(52,211,153,0.6)] animate-pulse'
                : 'w-67.5 h-7 px-3 justify-between cursor-pointer bg-[#120A03] ring-1 ring-emerald-500/40 border border-white/15'
              : 'w-28 h-5 px-2.5 justify-between pointer-events-none bg-[#120A03] border border-white/10'
          }`}
          onClick={activeOrder && onClearActiveOrder ? onClearActiveOrder : undefined}
          title={activeOrder ? 'Active order tracking — Click to dismiss' : undefined}
        >
          {activeOrder ? (
            <>
              <div className="flex items-center gap-1.5">
                <div
                  className={`w-2 h-2 rounded-full ${
                    isReady
                      ? 'bg-amber-400 animate-ping'
                      : isPrepping
                      ? 'bg-emerald-400 animate-ping'
                      : 'bg-amber-300 animate-pulse'
                  }`}
                />
                <span
                  className={`text-[10px] font-bold font-mono tracking-wider ${
                    isReady ? 'text-amber-300' : 'text-emerald-400'
                  }`}
                >
                  TOKEN #{activeOrder.token}
                </span>
              </div>
              <div
                className={`flex items-center gap-1 text-[10px] ${
                  isReady ? 'font-extrabold text-amber-200' : 'font-medium text-emerald-100/90'
                }`}
              >
                <span>{activeOrder.status}</span>
                <span className="text-white/50 text-[9px] hover:text-white">✕</span>
              </div>
            </>
          ) : (
            <>
              <div className="w-2.5 h-2.5 rounded-full bg-[#14231A] flex items-center justify-center">
                <div className="w-1 h-1 rounded-full bg-[#1C3A29]" />
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <div className="w-2 h-2 rounded-full bg-[#0F1A13]" />
              </div>
            </>
          )}
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
