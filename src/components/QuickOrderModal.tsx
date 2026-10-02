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

    if (!item.price || item.price <= 0) {
      setSubmitError('This item is coming soon and cannot be ordered yet.');
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
      className="absolute inset-0 z-50 flex flex-col justify-end bg-black/60 backdrop-blur-xs select-none animate-in fade-in duration-200"
      onClick={() => {
        playTapSound();
        close();
      }}
    >
      {/* Bottom sheet container with smooth height and scrolling */}
      <div
        ref={sheetRef}
        role="dialog"
        aria-modal="true"
        aria-label={`Quick order — ${item.name}`}
        className="w-full max-h-[92%] flex flex-col rounded-t-4xl bg-[#E8ECEF] border-t border-x border-white/70 shadow-2xl animate-in slide-in-from-bottom duration-200 overflow-hidden font-sans relative"
        style={{
          boxShadow: '0 -10px 30px rgba(0,0,0,0.3), -4px -4px 10px rgba(255,255,255,0.7)',
          transform: dragY > 0 ? `translateY(${dragY}px)` : undefined,
          transition: dragY === 0 ? 'transform 0.2s cubic-bezier(0.16, 1, 0.3, 1)' : 'none'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {submitted ? (
          /* Celebratory token confirmation */
          <div className="py-12 flex flex-col items-center justify-center text-center px-6 animate-in zoom-in-95 duration-200">
            <div className="relative">
              <CheckCircle className="w-16 h-16 text-[#F06A05] animate-bounce" />
              <Sparkles className="w-6 h-6 text-amber-500 absolute -top-1 -right-2 animate-spin" />
            </div>
            <div className="mt-4 inline-block px-4 py-1.5 rounded-full bg-emerald-100 border border-emerald-300 text-emerald-800 text-xs font-bold font-mono tracking-wider shadow-xs">
              PICKUP TOKEN #{confirmedToken}
            </div>
            <h3 className="text-xl font-extrabold text-[#1F140A] mt-3">Order Confirmed!</h3>
            <p className="text-xs font-semibold text-[#7A6658] mt-1.5 max-w-64 leading-relaxed">
              {item.vendor} received your order for {qty}× {item.name}{total > 0 ? ` · ₹${total}` : ''}
            </p>
            <p className="text-[11px] font-bold text-emerald-700 mt-3 bg-white/80 px-3.5 py-1 rounded-full shadow-xs">
              Live status pinned to Dynamic Island ⬆
            </p>
          </div>
        ) : (
          <form onSubmit={handleConfirm} className="flex flex-col max-h-full min-h-0">
            {/* Header: drag bar + close button + titles */}
            <div className="px-5 pt-3 pb-2 border-b border-[#D6DCE2]/60 shrink-0 relative">
              {/* Grab handle with touch-drag dismiss */}
              <div
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
                className="py-1 cursor-grab active:cursor-grabbing flex justify-center"
                title="Swipe down to dismiss"
              >
                <div className="w-12 h-1.5 rounded-full bg-[#CBD5E1] hover:bg-[#94A3B8] transition-colors" />
              </div>

              {/* Close Button */}
              <button
                type="button"
                onClick={close}
                aria-label="Close"
                className="absolute top-3 right-4 w-8 h-8 rounded-full bg-white/80 hover:bg-white border border-[#D6DCE2] flex items-center justify-center text-[#7A6658] hover:text-[#1F140A] active:scale-90 transition-all cursor-pointer shadow-xs"
              >
                <X className="w-4 h-4 stroke-[2.2]" />
              </button>

              <h2 className="mt-2 text-lg font-extrabold text-[#1F140A] tracking-tight">
                Delivery Details
              </h2>
              <p className="text-xs font-semibold text-[#7A6658] mt-0.5">
                Instant Campus Checkout • No Account Needed
              </p>
            </div>

            {/* Scrollable Body: Order details + Inputs */}
            <div className="flex-1 overflow-y-auto overscroll-contain px-5 py-4 space-y-4 min-h-0">
              {/* Order item & Stepper card */}
              <div className="p-3.5 rounded-2xl bg-white/80 border border-[#D6DCE2] flex items-center justify-between gap-3 shadow-xs">
                <div className="flex items-center gap-2.5 min-w-0">
                  <Stepper
                    min={1}
                    max={20}
                    value={qty}
                    onChange={setQty}
                    disabled={!item.price || item.price <= 0}
                    size="sm"
                    className="w-24 shrink-0"
                  />
                  <div className="min-w-0">
                    <p className="text-xs font-extrabold text-[#1F140A] truncate">
                      {item.name}
                    </p>
                    <p className="text-[11px] font-semibold text-[#7A6658] truncate">
                      {item.vendor}
                    </p>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="block text-[10px] font-bold uppercase tracking-wider text-[#7A6658]">
                    Total
                  </span>
                  <span className={`text-base font-black tabular-nums ${item.price > 0 ? 'text-[#F06A05]' : 'text-[#D96C37]'}`}>
                    {item.price > 0 ? `₹${total}` : 'Coming Soon'}
                  </span>
                </div>
              </div>

              {/* Mobile Number Field */}
              <div>
                <label
                  htmlFor="quick-order-mobile"
                  className="block text-xs font-bold text-[#1F140A] mb-1.5"
                >
                  Mobile Number
                </label>
                <div
                  className="relative h-11 rounded-2xl bg-[#E8ECEF] border border-[#D6DCE2] flex items-center shadow-inner"
                  style={{ boxShadow: 'inset 2px 2px 5px rgba(154,166,179,0.45), inset -2px -2px 5px rgba(255,255,255,0.85)' }}
                >
                  <Phone
                    className="absolute left-3.5 w-4 h-4 text-[#7A6658]"
                    strokeWidth={2}
                  />
                  <input
                    id="quick-order-mobile"
                    type="tel"
                    required
                    value={mobileNumber}
                    onChange={(e) => setMobileNumber(e.target.value)}
                    placeholder="Enter your mobile number"
                    aria-describedby="quick-order-error"
                    className="w-full h-full bg-transparent pl-10 pr-3.5 text-xs font-semibold text-[#1F140A] placeholder:text-[#94A3B8] focus:outline-none"
                  />
                </div>
              </div>

              {/* Delivery Address Field */}
              <div>
                <label
                  htmlFor="quick-order-address"
                  className="block text-xs font-bold text-[#1F140A] mb-1.5"
                >
                  Delivery Address / Landmark
                </label>
                <div
                  className="relative h-11 rounded-2xl bg-[#E8ECEF] border border-[#D6DCE2] flex items-center shadow-inner"
                  style={{ boxShadow: 'inset 2px 2px 5px rgba(154,166,179,0.45), inset -2px -2px 5px rgba(255,255,255,0.85)' }}
                >
                  <MapPin
                    className="absolute left-3.5 w-4 h-4 text-[#7A6658]"
                    strokeWidth={2}
                  />
                  <input
                    id="quick-order-address"
                    type="text"
                    required
                    value={deliveryAddress}
                    onChange={(e) => setDeliveryAddress(e.target.value)}
                    placeholder="Block, room or campus landmark"
                    className="w-full h-full bg-transparent pl-10 pr-3.5 text-xs font-semibold text-[#1F140A] placeholder:text-[#94A3B8] focus:outline-none"
                  />
                </div>
              </div>

              {/* Error line */}
              {submitError && (
                <div
                  id="quick-order-error"
                  role="alert"
                  className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold flex items-center gap-2"
                >
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{submitError}</span>
                </div>
              )}
            </div>

            {/* Sticky Footer: Confirm Order Button (Never cut off) */}
            <div className="p-4 pt-3 pb-5 bg-[#E8ECEF] border-t border-[#D6DCE2]/60 shrink-0">
              <button
                type="submit"
                disabled={submitting || !item.inStock || item.isShopOnline === false || !item.price || item.price <= 0}
                className="w-full h-12 rounded-xl bg-[#F06A05] hover:bg-[#D85800] text-white text-sm font-extrabold cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed btn-orange-shadow active:scale-[0.98] transition-all flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Sending to kitchen…</span>
                  </>
                ) : !item.inStock ? (
                  'Item Sold Out'
                ) : item.isShopOnline === false ? (
                  'Canteen Offline'
                ) : (!item.price || item.price <= 0) ? (
                  'Coming Soon • Cannot Order'
                ) : (
                  `Confirm Order • ₹${total}`
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default QuickOrderModal;
