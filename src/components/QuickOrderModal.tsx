import React, { useState, useRef } from 'react';
import { X, Phone, MapPin, CheckCircle, AlertCircle, Sparkles } from 'lucide-react';
import { placeOrder } from '../lib/api';
import { useModalA11y } from '../lib/useModalA11y';
import { playTapSound, playSuccessChime, fireOrderConfetti } from '../lib/celebration';
import { Stepper } from './Stepper';
import type { FoodItem } from '../lib/types';

export interface OrderSuccessData {
  token: string;
  orderId?: string;
  vendor: string;
  status: string;
}

interface QuickOrderModalProps {
  isOpen: boolean;
  item: FoodItem | null;
  initialQty?: number;
  onClose: () => void;
  onSuccess?: (data: OrderSuccessData) => void;
}

export const QuickOrderModal: React.FC<QuickOrderModalProps> = ({
  isOpen,
  item,
  initialQty = 1,
  onClose,
  onSuccess
}) => {
  const [qty, setQty] = useState(initialQty);
  const [mobileNumber, setMobileNumber] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [confirmedToken, setConfirmedToken] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const inFlight = useRef(false);
  const close = () => { if (!inFlight.current) onClose(); };

  // Synchronize quantity whenever initialQty or modal opening item changes
  React.useEffect(() => {
    if (isOpen) {
      setQty(initialQty > 0 ? initialQty : 1);
    }
  }, [isOpen, initialQty, item?.id]);

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
      close();
    }
    setDragY(0);
    touchStartY.current = null;
  };

  const sheetRef = useModalA11y<HTMLDivElement>(isOpen && !!item, close);

  if (!isOpen || !item) return null;

  const total = item.price * qty;

  const handleConfirm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (inFlight.current || submitted) return;
    playTapSound();
    if (!item.inStock) {
      setSubmitError('This item is currently sold out.');
      return;
    }

    if (item.isShopOnline === false) {
      setSubmitError('This canteen is currently offline and not accepting orders.');
      return;
    }

    inFlight.current = true;
    setSubmitting(true);
    setSubmitError(null);

    const res = await placeOrder({
      foodItem: item,
      mobile: mobileNumber,
      address: deliveryAddress,
      quantity: qty
    });

    inFlight.current = false;
    setSubmitting(false);

    if (!res.success || !res.token || !res.orderId) {
      setSubmitError(res.reason || 'Could not reach the shop. Please try again.');
      return;
    }

    const token = res.token;
    setConfirmedToken(token);
    playSuccessChime();
    fireOrderConfetti();
    setSubmitted(true);

    setTimeout(() => {
      setSubmitted(false);
      setQty(1);
      onSuccess?.({
        token,
        orderId: res.orderId,
        vendor: item.vendor,
        status: 'Sent to shop'
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
        close();
      }}
    >
      {/* Bottom sheet — x=13 y=272 w=349 h=414 rx=27 */}
      <div
        ref={sheetRef}
        role="dialog"
        aria-modal="true"
        aria-label={`Quick order — ${item.name}`}
        className="absolute left-3.25 right-3.25 top-65 h-106.5 rounded-[27px] bg-[#E8ECEF] border border-white/60 overflow-hidden animate-in fade-in slide-in-from-bottom-6 duration-200"
        style={{
          boxShadow: '-6px -6px 12px rgba(255,255,255,0.85), 6px 6px 12px rgba(163,174,187,0.45)',
          transform: dragY > 0 ? `translateY(${dragY}px)` : undefined,
          transition: dragY === 0 ? 'transform 0.2s cubic-bezier(0.16, 1, 0.3, 1)' : 'none'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {submitted ? (
          /* Celebratory token confirmation */
          <div className="h-full flex flex-col items-center justify-center text-center px-4.5 animate-in zoom-in-95 duration-200">
            <div className="relative">
              <CheckCircle className="w-16 h-16 text-[#F06A05] animate-bounce" />
              <Sparkles className="w-6 h-6 text-amber-500 absolute -top-1 -right-2 animate-spin" />
            </div>
            <div className="mt-3 inline-block px-3 py-1 rounded-full bg-emerald-100 border border-emerald-300 text-emerald-800 text-[11px] font-bold font-mono tracking-wider shadow-sm">
              PICKUP TOKEN #{confirmedToken}
            </div>
            <h3 className="text-[18px] font-extrabold text-[#1F140A] mt-2">Order Confirmed!</h3>
            <p className="text-[11px] font-semibold text-[#7A6658] mt-1 max-w-60">
              {item.vendor} received your order for {qty}× {item.name}{total > 0 ? ` · ₹${total}` : ''}
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
              className="pt-2.25 pb-1 cursor-grab active:cursor-grabbing"
              title="Swipe down to dismiss"
            >
              <div className="mx-auto w-11.25 h-1 rounded-xs bg-[#D6DCE2] hover:bg-[#8EA699] transition-colors" />
            </div>

            {/* Close X — 18px icon, center 24.5px from right edge, 34px from sheet top */}
            <button
              type="button"
              onClick={close}
              aria-label="Close"
              className="absolute top-4.75 right-2.5 w-6 h-6 flex items-center justify-center cursor-pointer"
            >
              <X className="w-4.75 h-4.75 text-[#6A8174]" strokeWidth={1.9} />
            </button>

            <div className="px-4.5">
              {/* Title — 17px w800, baseline 38px from sheet top */}
              <h2 className="mt-3 text-[17px] font-extrabold leading-5.5 text-[#1F140A]">
                Delivery Details
              </h2>

              {/* Subtitle — 11px w600, baseline 55px from sheet top */}
              <p className="mt-px text-[11px] font-semibold leading-3.5 text-[#7A6658]">
                Instant Campus Checkout • No Account Needed
              </p>

              {/* Divider — y=336 (64px from sheet top), #D6DCE2, 18px insets */}
              <div className="mt-1.75 h-px bg-[#D6DCE2]" />

              {/* Order Details row — baselines y=352 / y=376 */}
              <div className="mt-2 flex items-baseline justify-between">
                <span className="text-[13px] font-extrabold text-[#1F140A]">Order Details</span>
                <span className="text-[12px] font-bold text-[#1F140A]">Total</span>
              </div>
              <div className="mt-1.5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {/* Quantity Stepper */}
                  <Stepper
                    min={1}
                    max={20}
                    value={qty}
                    onChange={setQty}
                    size="sm"
                    className="w-24"
                  />
                  <span className="text-[11px] font-semibold text-[#7A6658] truncate max-w-42.5">
                    {item.name} · {item.vendor}
                  </span>
                </div>
                <span className="text-[15px] font-extrabold text-[#1F140A] tabular-nums">
                  {total > 0 ? `₹${total}` : 'Coming Soon'}
                </span>
              </div>

              {/* Divider — y=392 (120px from sheet top), #C4D2CB */}
              <div className="mt-2.25 h-px bg-[#C4D2CB]" />

              {/* Mobile Number — label baseline y=420, input y=431 h=43 rx=21 */}
              <label
                htmlFor="quick-order-mobile"
                className="block mt-4.75 text-[13px] font-bold leading-4.25 text-[#1F140A]"
              >
                Mobile Number
              </label>
              <div
                className="relative mt-1.25 h-10.75 rounded-[21px] bg-[#E8ECEF] border border-[#D6DCE2]"
                style={{ boxShadow: 'inset 3px 3px 6px rgba(154,166,179,0.5), inset -3px -3px 6px rgba(255,255,255,0.85)' }}
              >
                <Phone
                  className="absolute left-3.25 top-1/2 -translate-y-1/2 w-4.75 h-4.75 text-[#466957]"
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
                  className="w-full h-full bg-transparent rounded-[21px] pl-10 pr-3.5 text-[12px] font-medium text-[#1F140A] placeholder:text-[#6B8075] focus:outline-none"
                />
              </div>

              {/* Delivery Address — label baseline y=502, input y=513 h=43 rx=21 */}
              <label
                htmlFor="quick-order-address"
                className="block mt-4.75 text-[13px] font-bold leading-4.25 text-[#1F140A]"
              >
                Delivery Address
              </label>
              <div
                className="relative mt-1.25 h-10.75 rounded-[21px] bg-[#E8ECEF] border border-[#D6DCE2]"
                style={{ boxShadow: 'inset 3px 3px 6px rgba(154,166,179,0.5), inset -3px -3px 6px rgba(255,255,255,0.85)' }}
              >
                <MapPin
                  className="absolute left-3.25 top-1/2 -translate-y-1/2 w-4.75 h-4.75 text-[#466957]"
                  strokeWidth={1.9}
                />
                <input
                  id="quick-order-address"
                  type="text"
                  required
                  value={deliveryAddress}
                  onChange={(e) => setDeliveryAddress(e.target.value)}
                  placeholder="Block, room or campus landmark"
                  className="w-full h-full bg-transparent rounded-[21px] pl-10 pr-3.5 text-[12px] font-medium text-[#1F140A] placeholder:text-[#6B8075] focus:outline-none"
                />
              </div>

              {/* Error line (only on failure — sits in the 49px gap above the CTA) */}
              {submitError && (
                <div
                  id="quick-order-error"
                  role="alert"
                  className="mt-2.5 flex items-center gap-1.5 text-[10px] font-bold text-red-600"
                >
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{submitError}</span>
                </div>
              )}

              {/* Confirm Order Button */}
              <button
                type="submit"
                disabled={submitting || !item.inStock || item.isShopOnline === false}
                className="absolute left-4 right-4 bottom-8.5 h-11.75 rounded-xl bg-[#F06A05] text-white text-[14px] font-bold cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#E05D00] active:scale-[0.98] transition-all"
                style={{ boxShadow: '-3px -3px 7px rgba(255,255,255,0.8), 4px 4px 8px rgba(163,174,187,0.4)' }}
              >
                {submitting
                  ? 'Sending to vendor…'
                  : !item.inStock
                  ? 'Item Sold Out'
                  : item.isShopOnline === false
                  ? 'Canteen Offline'
                  : 'Confirm Order'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
