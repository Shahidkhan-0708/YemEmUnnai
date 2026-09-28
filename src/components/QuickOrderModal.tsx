import React, { useState } from 'react';
import { X, Phone, MapPin, CheckCircle, AlertCircle } from 'lucide-react';
import { placeOrder } from '../lib/api';
import { useModalA11y } from '../lib/useModalA11y';
import type { FoodItem } from '../lib/types';

interface QuickOrderModalProps {
  isOpen: boolean;
  item: FoodItem | null;
  onClose: () => void;
  onSuccess?: () => void;
}

/**
 * Screen 02 — "Quick Order / Delivery Details" bottom sheet.
 *
 * Rebuilt 1:1 from figma_svgs/02_quick_order_modal.svg (375 × 812):
 *   - Dim overlay ........ rect #032A15 @ 0.43 opacity over the home feed
 *   - Sheet .............. x=13 y=272 w=349 h=414 rx=27 fill #E5EDE9,
 *                          stroke #FFF @ .85, "soft" shadow (blur 6 / dy 5 / #093B1E @ .12)
 *   - Grab handle ........ 45 × 4 rx=2 #BAC8C0 centered, 9px from sheet top
 *   - Title .............. "Delivery Details" 17px w800 #0A2E20 (baseline y=310)
 *   - Subtitle ........... "Instant Campus Checkout • No Account Needed" 11px w600 #5C7A6D
 *   - Divider ............ y=336 #CAD8D0, 18px side insets
 *   - Close .............. lucide X 24px @ .75 (18px) stroke #6A8174, center (337.5, 306)
 *   - Order rows ......... "Order Details"/"Order" 13px w800 + 12px w700 (baseline y=352)
 *                          "{item} × {qty} · {vendor}" 11px w500 / "₹40" 15px w800 (baseline y=376)
 *   - Divider ............ y=392 #C4D2CB
 *   - Inputs ............. x=29 w=317 h=43 rx=21 fill #DCE5E0 stroke #C4D2CB,
 *                          "inset" shadow (#648273 @ .18), lucide icons 24px @ .79 (#466957),
 *                          placeholder 12px w500 #6B8075
 *   - CTA ................ x=29 y=605 w=317 h=47 rx=12 #09431B, 14px w700 white,
 *                          "buttonShadow" (blur 2 / dy 2 / #093B1E @ .16)
 *   - Sheet bottom padding 34px (686 − 652)
 */
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
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const sheetRef = useModalA11y<HTMLDivElement>(isOpen && !!item, onClose);

  if (!isOpen || !item) return null;

  const total = item.price * qty;

  const handleConfirm = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmitError(null);

    const ok = await placeOrder({
      foodItem: item,
      mobile: mobileNumber,
      address: deliveryAddress
    });

    setSubmitting(false);

    if (!ok) {
      setSubmitError('Could not reach the shop. Please try again.');
      return;
    }

    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setQty(2);
      onSuccess?.();
      onClose();
    }, 1200);
  };

  return (
    <div
      className="absolute inset-0 z-50"
      style={{ background: 'rgba(3, 42, 21, 0.43)' }}
      onClick={onClose}
    >
      {/* Bottom sheet — x=13 y=272 w=349 h=414 rx=27 */}
      <div
        ref={sheetRef}
        role="dialog"
        aria-modal="true"
        aria-label={`Quick order — ${item.name}`}
        className="absolute left-[13px] right-[13px] top-[272px] h-[414px] rounded-[27px] bg-[#E8ECEF] border border-white/60 overflow-hidden animate-in fade-in slide-in-from-bottom-6 duration-200"
        style={{ boxShadow: '-6px -6px 12px rgba(255,255,255,0.85), 6px 6px 12px rgba(163,174,187,0.45)' }}
        onClick={(e) => e.stopPropagation()}
      >
        {submitted ? (
          /* Success state (not in the static design; keeps the same sheet) */
          <div className="h-full flex flex-col items-center justify-center text-center px-[18px]">
            <CheckCircle className="w-14 h-14 text-[#09431B]" />
            <h3 className="text-[17px] font-extrabold text-[#0A2E20] mt-3">Order Confirmed!</h3>
            <p className="text-[11px] font-semibold text-[#5C7A6D] mt-1">
              {item.vendor} received your order · ₹{total}
            </p>
          </div>
        ) : (
          <form onSubmit={handleConfirm} className="h-full">
            {/* Grab handle — 45×4 rx=2 #BAC8C0, 9px from sheet top */}
            <div className="mx-auto mt-[9px] w-[45px] h-[4px] rounded-[2px] bg-[#BAC8C0]" />

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
              <div className="mt-[9px] flex items-baseline justify-between">
                <span className="text-[13px] font-extrabold text-[#0A2E20]">Order Details</span>
                <span className="text-[12px] font-bold text-[#0A2E20]">Order</span>
              </div>
              <div className="mt-[9px] flex items-baseline justify-between">
                <span className="text-[11px] font-medium text-[#5C7A6D]">
                  {item.name} × {qty} · {item.vendor}
                </span>
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
