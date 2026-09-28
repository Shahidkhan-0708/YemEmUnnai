import React, { useState, useRef } from 'react';
import { X, Phone, MapPin, CheckCircle, AlertCircle, Sparkles } from 'lucide-react';
import { placeOrder } from '../lib/api';
import { useModalA11y } from '../lib/useModalA11y';
import { playTapSound, playSuccessChime, fireOrderConfetti } from '../lib/celebration';
import type { FoodItem } from '../lib/types';

export interface OrderSuccessData {
  token: string;
  vendor: string;
  status: string;
}

interface QuickOrderModalProps {
  isOpen: boolean;
  item: FoodItem | null;
  onClose: () => void;
  onSuccess?: (data: OrderSuccessData) => void;
}

export const QuickOrderModal: React.FC<QuickOrderModalProps> = ({
  isOpen,
  item,
  onClose,
  onSuccess
}) => {
  // The design shows "Samosa × 2 · MITS Canteen" → ₹40, so qty starts at 2.
  const [qty, setQty] = useState(2);
  const [mobileNumber, setMobileNumber] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [confirmedToken, setConfirmedToken] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Swipe/drag down to dismiss handle
  const [dragY, setDragY] = useState(0);
  const touchStartY = useRef<number | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStartY.current === null) return;
    const diff = e.touches[0].clientY - touchStartY.current;
    if (diff > 0) {
      setDragY(diff);
    }
  };

  const handleTouchEnd = () => {
    if (dragY > 80) {
      playTapSound();
      onClose();
    }
    setDragY(0);
    touchStartY.current = null;
  };

  const sheetRef = useModalA11y<HTMLDivElement>(isOpen && !!item, onClose);

  if (!isOpen || !item) return null;

  const total = item.price * qty;

  const handleConfirm = async (e: React.FormEvent) => {
    e.preventDefault();
    playTapSound();
    setSubmitting(true);
    setSubmitError(null);

    const res = await placeOrder({
      foodItem: item,
      mobile: mobileNumber,
      address: deliveryAddress
    });

    setSubmitting(false);

    if (!res.success) {
      setSubmitError('Could not reach the shop. Please try again.');
      return;
    }

    const token = res.token || Math.floor(100 + Math.random() * 900).toString();
    setConfirmedToken(token);
    playSuccessChime();
    fireOrderConfetti();
    setSubmitted(true);

    setTimeout(() => {
      setSubmitted(false);
      setQty(2);
      onSuccess?.({
        token,
        vendor: item.vendor,
        status: 'Preparing (~5m)'
      });
      onClose();
    }, 1600);
  };

  return (
    <div
      className="absolute inset-0 z-50 backdrop-blur-[1px] transition-opacity"
      style={{ background: 'rgba(3, 42, 21, 0.43)' }}
      onClick={() => {
        playTapSound();
        onClose();
      }}
    >
      {/* Bottom sheet — x=13 y=272 w=349 h=414 rx=27 */}
      <div
        ref={sheetRef}
        role="dialog"
        aria-modal="true"
        aria-label={`Quick order — ${item.name}`}
        className="absolute left-[13px] right-[13px] top-[260px] h-[426px] rounded-[27px] bg-[#E8ECEF] border border-white/60 overflow-hidden animate-in fade-in slide-in-from-bottom-6 duration-200"
        style={{
          boxShadow: '-6px -6px 12px rgba(255,255,255,0.85), 6px 6px 12px rgba(163,174,187,0.45)',
          transform: dragY > 0 ? `translateY(${dragY}px)` : undefined,
          transition: dragY === 0 ? 'transform 0.2s cubic-bezier(0.16, 1, 0.3, 1)' : 'none'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {submitted ? (
          /* Celebratory token confirmation */
          <div className="h-full flex flex-col items-center justify-center text-center px-[18px] animate-in zoom-in-95 duration-200">
            <div className="relative">
              <CheckCircle className="w-16 h-16 text-[#09431B] animate-bounce" />
              <Sparkles className="w-6 h-6 text-amber-500 absolute -top-1 -right-2 animate-spin" />
            </div>
            <div className="mt-3 inline-block px-3 py-1 rounded-full bg-emerald-100 border border-emerald-300 text-emerald-800 text-[11px] font-bold font-mono tracking-wider shadow-sm">
              PICKUP TOKEN #{confirmedToken}
            </div>
            <h3 className="text-[18px] font-extrabold text-[#0A2E20] mt-2">Order Confirmed!</h3>
            <p className="text-[11px] font-semibold text-[#5C7A6D] mt-1 max-w-[240px]">
              {item.vendor} received your order for {qty}× {item.name} · ₹{total}
            </p>
            <p className="text-[10px] font-medium text-emerald-700 mt-2 bg-white/70 px-3 py-0.5 rounded-full">
              Live status pinned to Dynamic Island ⬆
            </p>
          </div>
        ) : (
          <form onSubmit={handleConfirm} className="h-full">
            {/* Grab handle with touch-drag dismiss */}
            <div
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
              className="pt-[9px] pb-1 cursor-grab active:cursor-grabbing"
              title="Swipe down to dismiss"
            >
              <div className="mx-auto w-[45px] h-[4px] rounded-[2px] bg-[#BAC8C0] hover:bg-[#8EA699] transition-colors" />
            </div>

            {/* Close X — 18px icon, center 24.5px from right edge, 34px from sheet top */}
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="absolute top-[19px] right-[10px] w-[24px] h-[24px] flex items-center justify-center cursor-pointer"
            >
              <X className="w-[19px] h-[19px] text-[#6A8174]" strokeWidth={1.9} />
            </button>

            <div className="px-[18px]">
              {/* Title — 17px w800, baseline 38px from sheet top */}
              <h2 className="mt-[12px] text-[17px] font-extrabold leading-[22px] text-[#0A2E20]">
                Delivery Details
              </h2>

              {/* Subtitle — 11px w600, baseline 55px from sheet top */}
              <p className="mt-[1px] text-[11px] font-semibold leading-[14px] text-[#5C7A6D]">
                Instant Campus Checkout • No Account Needed
              </p>

              {/* Divider — y=336 (64px from sheet top), #CAD8D0, 18px insets */}
              <div className="mt-[7px] h-px bg-[#CAD8D0]" />

              {/* Order Details row — baselines y=352 / y=376 */}
              <div className="mt-[8px] flex items-baseline justify-between">
                <span className="text-[13px] font-extrabold text-[#0A2E20]">Order Details</span>
                <span className="text-[12px] font-bold text-[#0A2E20]">Total</span>
              </div>
              <div className="mt-[6px] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {/* Quantity Stepper */}
                  <div
                    className="flex items-center bg-[#DDE6E1] rounded-full p-0.5 border border-[#CAD8D0]"
                    style={{ boxShadow: 'inset 1px 1px 3px rgba(154,166,179,0.4), inset -1px -1px 3px rgba(255,255,255,0.7)' }}
                  >
                    <button
                      type="button"
                      aria-label="Decrease quantity"
                      onClick={() => {
                        playTapSound();
                        setQty(q => Math.max(1, q - 1));
                      }}
                      className="w-5 h-5 rounded-full bg-white flex items-center justify-center text-[12px] font-bold text-[#0A2E20] shadow-sm active:scale-90 transition-transform cursor-pointer"
                    >
                      -
                    </button>
                    <span className="px-2 text-[12px] font-extrabold text-[#0A2E20] tabular-nums">{qty}</span>
                    <button
                      type="button"
                      aria-label="Increase quantity"
                      onClick={() => {
                        playTapSound();
                        setQty(q => Math.min(10, q + 1));
                      }}
                      className="w-5 h-5 rounded-full bg-[#09431B] flex items-center justify-center text-[12px] font-bold text-white shadow-sm active:scale-90 transition-transform cursor-pointer"
                    >
                      +
                    </button>
                  </div>
                  <span className="text-[11px] font-semibold text-[#5C7A6D] truncate max-w-[170px]">
                    {item.name} · {item.vendor}
                  </span>
                </div>
                <span className="text-[15px] font-extrabold text-[#0A2E20] tabular-nums">₹{total}</span>
              </div>

              {/* Divider — y=392 (120px from sheet top), #C4D2CB */}
              <div className="mt-[9px] h-px bg-[#C4D2CB]" />

              {/* Mobile Number — label baseline y=420, input y=431 h=43 rx=21 */}
              <label
                htmlFor="quick-order-mobile"
                className="block mt-[19px] text-[13px] font-bold leading-[17px] text-[#0A2E20]"
              >
                Mobile Number
              </label>
              <div
                className="relative mt-[5px] h-[43px] rounded-[21px] bg-[#E8ECEF] border border-[#D6DCE2]"
                style={{ boxShadow: 'inset 3px 3px 6px rgba(154,166,179,0.5), inset -3px -3px 6px rgba(255,255,255,0.85)' }}
              >
                <Phone
                  className="absolute left-[13px] top-1/2 -translate-y-1/2 w-[19px] h-[19px] text-[#466957]"
                  strokeWidth={1.9}
                />
                <input
                  id="quick-order-mobile"
                  type="tel"
                  required
                  value={mobileNumber}
                  onChange={(e) => setMobileNumber(e.target.value)}
                  placeholder="Mobile number"
                  aria-describedby="quick-order-error"
                  className="w-full h-full bg-transparent rounded-[21px] pl-[40px] pr-[14px] text-[12px] font-medium text-[#0A2E20] placeholder:text-[#6B8075] focus:outline-none"
                />
              </div>

              {/* Delivery Address — label baseline y=502, input y=513 h=43 rx=21 */}
              <label
                htmlFor="quick-order-address"
                className="block mt-[19px] text-[13px] font-bold leading-[17px] text-[#0A2E20]"
              >
                Delivery Address
              </label>
              <div
                className="relative mt-[5px] h-[43px] rounded-[21px] bg-[#E8ECEF] border border-[#D6DCE2]"
                style={{ boxShadow: 'inset 3px 3px 6px rgba(154,166,179,0.5), inset -3px -3px 6px rgba(255,255,255,0.85)' }}
              >
                <MapPin
                  className="absolute left-[13px] top-1/2 -translate-y-1/2 w-[19px] h-[19px] text-[#466957]"
                  strokeWidth={1.9}
                />
                <input
                  id="quick-order-address"
                  type="text"
                  required
                  value={deliveryAddress}
                  onChange={(e) => setDeliveryAddress(e.target.value)}
                  placeholder="Block, room or campus landmark"
                  className="w-full h-full bg-transparent rounded-[21px] pl-[40px] pr-[14px] text-[12px] font-medium text-[#0A2E20] placeholder:text-[#6B8075] focus:outline-none"
                />
              </div>

              {/* Error line (only on failure — sits in the 49px gap above the CTA) */}
              {submitError && (
                <div
                  id="quick-order-error"
                  role="alert"
                  className="mt-[10px] flex items-center gap-1.5 text-[10px] font-bold text-red-600"
                >
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{submitError}</span>
                </div>
              )}

              {/* Confirm Order — y=605 w=317 h=47 rx=12 #09431B, text 14px w700 */}
              <button
                type="submit"
                disabled={submitting}
                className="absolute left-[16px] right-[16px] bottom-[34px] h-[47px] rounded-[12px] bg-[#09431B] text-white text-[14px] font-bold cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed hover:bg-[#073515] active:scale-[0.98] transition-all"
                style={{ boxShadow: '-3px -3px 7px rgba(255,255,255,0.8), 4px 4px 8px rgba(163,174,187,0.4)' }}
              >
                {submitting ? 'Sending to vendor…' : 'Confirm Order'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
