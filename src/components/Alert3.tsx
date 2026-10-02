'use client';

import React, { useState } from 'react';
import { RxCross2 } from 'react-icons/rx';
import { AlertCircle, Bell, CheckCircle2, WifiOff } from 'lucide-react';
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from '@/components/base-ui/alert';

export interface Alert3Props {
  ordersCount?: number;
  pendingOrdersCount?: number;
  error?: string | null;
  isOnline?: boolean;
  className?: string;
}

export const Alert3: React.FC<Alert3Props> = ({
  ordersCount = 0,
  pendingOrdersCount = 0,
  error = null,
  isOnline = true,
  className = '',
}) => {
  const [isActive, setIsActive] = useState(true);

  if (!isActive) return null;

  // 1. Error state
  if (error) {
    return (
      <Alert className={`flex items-start justify-between bg-rose-50 border border-rose-200 text-rose-900 rounded-2xl p-3.5 shadow-xs ${className}`}>
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div className="flex-1 flex flex-col gap-0.5">
            <AlertTitle className="text-xs font-black text-rose-950">Connection Notice</AlertTitle>
            <AlertDescription className="text-[11px] font-medium text-rose-800 leading-relaxed">{error}</AlertDescription>
          </div>
        </div>
        <button
          className="cursor-pointer text-rose-500 hover:text-rose-800 p-1 rounded-lg transition-colors ml-2"
          onClick={() => setIsActive(false)}
          aria-label="Dismiss alert"
        >
          <RxCross2 className="size-4" />
        </button>
      </Alert>
    );
  }

  // 2. Offline state
  if (isOnline === false) {
    return (
      <Alert className={`flex items-start justify-between bg-amber-50 border border-amber-200 text-amber-900 rounded-2xl p-3.5 shadow-xs ${className}`}>
        <div className="flex items-start gap-3">
          <WifiOff className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="flex-1 flex flex-col gap-0.5">
            <AlertTitle className="text-xs font-black text-amber-950">Shop is Currently Offline</AlertTitle>
            <AlertDescription className="text-[11px] font-medium text-amber-800 leading-relaxed">
              Students cannot place orders right now. Toggle online in your header to resume live orders.
            </AlertDescription>
          </div>
        </div>
        <button
          className="cursor-pointer text-amber-500 hover:text-amber-800 p-1 rounded-lg transition-colors ml-2"
          onClick={() => setIsActive(false)}
          aria-label="Dismiss alert"
        >
          <RxCross2 className="size-4" />
        </button>
      </Alert>
    );
  }

  // 3. Incoming pending orders alert
  if (pendingOrdersCount > 0) {
    return (
      <Alert className={`flex items-start justify-between bg-orange-50 border border-orange-200 text-orange-950 rounded-2xl p-3.5 shadow-xs animate-in fade-in duration-200 ${className}`}>
        <div className="flex items-start gap-3">
          <div className="relative w-5 h-5 shrink-0 mt-0.5 flex items-center justify-center">
            <Bell className="w-5 h-5 text-[#F06A05] animate-bounce" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-rose-500 rounded-full animate-ping" />
          </div>
          <div className="flex-1 flex flex-col gap-0.5">
            <AlertTitle className="text-xs font-black text-[#1F140A]">
              {pendingOrdersCount} New Order{pendingOrdersCount > 1 ? 's' : ''} Received!
            </AlertTitle>
            <AlertDescription className="text-[11px] font-medium text-[#7A6658] leading-relaxed">
              Kitchen confirmation required. Check incoming orders below to accept or decline.
            </AlertDescription>
          </div>
        </div>
        <button
          className="cursor-pointer text-[#7A6658] hover:text-[#1F140A] p-1 rounded-lg transition-colors ml-2"
          onClick={() => setIsActive(false)}
          aria-label="Dismiss alert"
        >
          <RxCross2 className="size-4" />
        </button>
      </Alert>
    );
  }

  // 4. Default live healthy status banner
  return (
    <Alert className={`flex items-start justify-between bg-[#E8ECEF] border border-[#D6DCE2] text-[#1F140A] rounded-2xl p-3.5 shadow-xs ${className}`}>
      <div className="flex items-start gap-3">
        <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
        <div className="flex-1 flex flex-col gap-0.5">
          <AlertTitle className="text-xs font-black text-[#1F140A]">Kitchen Radar Live</AlertTitle>
          <AlertDescription className="text-[11px] font-medium text-[#7A6658] leading-relaxed">
            All systems running smoothly • {ordersCount} active order{ordersCount === 1 ? '' : 's'} tracked in real-time.
          </AlertDescription>
        </div>
      </div>
      <button
        className="cursor-pointer text-[#7A6658] hover:text-[#1F140A] p-1 rounded-lg transition-colors ml-2"
        onClick={() => setIsActive(false)}
        aria-label="Dismiss alert"
      >
        <RxCross2 className="size-4" />
      </button>
    </Alert>
  );
};

export default Alert3;
