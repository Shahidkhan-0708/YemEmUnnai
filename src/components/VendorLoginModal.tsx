import React, { useState } from 'react';
import { X, AlertCircle, Delete, Zap } from 'lucide-react';
import { useVendorSession } from '../lib/hooks';
import { useModalA11y } from '../lib/useModalA11y';
import { isBackendConfigured, CAMPUS_ACCESS_PINS } from '../lib/api';

interface VendorLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Screen 12 — "Student & Vendor Access Login", 1:1 from
 * figma_svgs/12_access_login.svg (375 × 812), adapted to vendor auth:
 *   - Back nav ....... 36px circle #EFF5EF at (38,54), chevron 24px; "Campus Access" 14px w800 centered (y=59)
 *   - Mascot ......... 76px ring: r38 #0A461E + r35 #E5EDE9 + mascot r33, center (187.5,120)
 *   - Welcome ........ "Welcome to YEMEMUNNAI!" 18px w800 (y=180); sub 11px w600 (y=198)
 *   - Role tabs ...... 335×42 rx=12 #DDE7E1 at (20,215); active pill 164×36 rx=10 #09431B (x=3);
 *                      "Student / Faculty" / "Canteen Vendor" 12px w800/w700
 *   - ID field ....... label 10px w800 ls .8 (y=275); box 335×50 rx=12 #EFF5EF stroke
 *                      #09431B 1.8 inset; value 15px w800 ls 1 + caret 2×18 #09431B;
 *                      verified badge 22px circle #10B981 + white check
 *   - PIN ............ label 10px w800 (y=360); 4 × 74×50 rx=12 inset boxes, digits 20px w800;
 *                      active box stroke #09431B 1.8 + dot r4 #09431B
 *   - Numpad ......... 3×4 grid at (35,445): keys 90×52 rx=12 #EFF5EF white-stroke
 *                      buttonShadow, digits 18px w800; backspace key 90×52 #E2EDE6 ⌫ 16px;
 *                      column gap 17px, row gap 8px
 */
export const VendorLoginModal: React.FC<VendorLoginModalProps> = ({ isOpen, onClose }) => {
  const { signInWithPin, signInDemo } = useVendorSession();
  const [selectedOutlet, setSelectedOutlet] = useState('MITS Canteen');
  const [pin, setPin] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const rootRef = useModalA11y<HTMLDivElement>(isOpen, onClose);

  if (!isOpen) return null;

  /** Vendor path: 4-digit campus PIN → auto sign-in, no keyboard needed. */
  const attemptPin = async (candidate: string) => {
    if (busy) return;
    if (!CAMPUS_ACCESS_PINS.includes(candidate)) {
      setError('Invalid campus PIN — try 0708 or 1234');
      setPin('');
      return;
    }
    setBusy(true);
    setError(null);
    const res = await signInWithPin(candidate);
    setBusy(false);
    if (!res.ok) {
      setError(res.error ?? 'Sign-in failed');
      setPin('');
      return;
    }
    onClose();
  };

  const appendDigit = (d: string) => {
    setPin(prev => {
      if (prev.length >= 4) return prev;
      const next = prev + d;
      if (next.length === 4) void attemptPin(next);
      return next;
    });
  };

  const handleDemoAccess = async () => {
    setBusy(true);
    setError(null);
    const res = await signInDemo();
    setBusy(false);
    if (!res.ok) {
      setError(res.error ?? 'Demo sign-in failed');
      return;
    }
    onClose();
  };

  const backspace = () => {
    setPin(prev => prev.slice(0, -1));
  };

  const handleSignIn = async () => {
    await attemptPin(pin);
  };

  const numpadKeys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', '⌫'] as const;

  return (
    <div
      ref={rootRef}
      role="dialog"
      aria-modal="true"
      aria-label="Campus access login"
      className="absolute inset-0 z-50 bg-[#E8ECEF] overflow-hidden animate-in fade-in duration-200"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="relative w-full h-full max-w-97.5 mx-auto min-h-205">
        {/* Header — back circle at (20,36) r18, title baseline y=59 */}
        <div className="absolute left-5 top-9 flex items-center">
          <button
            type="button"
            onClick={onClose}
            aria-label="Back"
            className="w-9 h-9 rounded-full bg-[#E8ECEF] border border-white flex items-center justify-center cursor-pointer"
            style={{ boxShadow: '-3px -3px 7px rgba(255,255,255,0.8), 4px 4px 8px rgba(163,174,187,0.4)' }}
          >
            <X className="w-4.5 h-4.5 text-[#0A2E20]" strokeWidth={2.2} />
          </button>
          <span className="absolute left-41.75 w-full text-[14px] font-extrabold text-[#0A2E20]">
            Campus Access
          </span>
        </div>

        {/* Mascot — 76px ring, center (187.5,100) */}
        <div className="absolute left-1/2 -translate-x-1/2 top-18 w-18 h-18 rounded-full bg-[#0A461E] flex items-center justify-center"
          style={{ boxShadow: '-3px -3px 7px rgba(255,255,255,0.8), 4px 4px 8px rgba(163,174,187,0.4)' }}
        >
          <div className="w-16.5 h-16.5 rounded-full bg-[#062814] overflow-hidden flex items-center justify-center p-0.5">
            <img src="/images/logo.png" alt="YEMUNNAI logo" className="w-full h-full object-contain" />
          </div>
        </div>

        {/* Welcome Header */}
        <h2 className="absolute top-38 w-full text-center text-[18px] font-extrabold text-[#0A2E20]">
          Canteen Vendor Login
        </h2>
        <p className="absolute top-44 w-full text-center text-[11px] font-semibold text-[#5C7A6D]">
          Enter your 4-digit campus security PIN
        </p>

        {/* Canteen Name / Account Info Field */}
        <span className="absolute left-6 top-51.5 text-[10px] font-extrabold tracking-[0.8px] text-[#0A2E20]">
          CANTEEN OUTLET
        </span>
        <div
          className="absolute left-5 right-5 top-56.25 h-11.5 rounded-xl bg-[#E8ECEF] flex items-center px-3"
          style={{
            border: '1.8px solid #09431B',
            boxShadow: 'inset 3px 3px 6px rgba(154,166,179,0.5), inset -3px -3px 6px rgba(255,255,255,0.85)'
          }}
        >
          <select
            value={selectedOutlet}
            onChange={(e) => setSelectedOutlet(e.target.value)}
            className="flex-1 bg-transparent text-[13px] font-extrabold tracking-[0.5px] text-[#0A2E20] focus:outline-none cursor-pointer"
          >
            <option value="MITS Canteen">MITS Canteen (Food Court)</option>
            <option value="MITS Cafe">MITS Cafe (Near Main Block)</option>
            <option value="Ekdant's Cafe">Ekdant's Cafe (Beside Library)</option>
            <option value="Lickies">Lickies (Opposite GATE 1)</option>
            <option value="New Cafe">New Cafe (Near Boys Hostel)</option>
          </select>
          <span className="w-5 h-5 rounded-full bg-[#10B981] flex items-center justify-center shrink-0">
            <svg width="12" height="12" viewBox="0 0 14 14" aria-hidden>
              <path d="M3.5 7 L6 9.5 L10.5 4" fill="none" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </span>
        </div>

        {/* PIN field — 4-digit boxes */}
        <span className="absolute left-6 top-70.5 text-[10px] font-extrabold tracking-[0.8px] text-[#0A2E20]">
          SECURITY PIN (4 DIGITS)
        </span>
        <div className="absolute left-5 right-5 top-75.25 flex gap-3">
          {[0, 1, 2, 3].map((i) => {
            const digit = pin[i] ?? '';
            const isActive = i === pin.length;
            return (
              <div
                key={i}
                className="flex-1 h-11.5 rounded-xl bg-[#E8ECEF] flex items-center justify-center"
                style={{
                  border: isActive ? '1.8px solid #09431B' : '1px solid #CAD8D0',
                  boxShadow: 'inset 3px 3px 6px rgba(154,166,179,0.5), inset -3px -3px 6px rgba(255,255,255,0.85)'
                }}
              >
                {digit ? (
                  <span className="text-[20px] font-extrabold text-[#0A2E20]">{digit}</span>
                ) : isActive ? (
                  <span className="w-2 h-2 rounded-full bg-[#09431B]" />
                ) : null}
              </div>
            );
          })}
        </div>

        {/* Error notification line */}
        {error && (
          <div
            role="alert"
            className="absolute left-6 right-6 top-89.25 flex items-center gap-1.5 text-[10px] font-bold text-red-600"
          >
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Numpad — shifted up to avoid any overlap or clipping */}
        <div className="absolute left-8.75 top-95 grid grid-cols-3 gap-x-4.25 gap-y-2">
          {numpadKeys.map((k, i) => {
            if (k === '') return <span key={i} />;
            if (k === '⌫') {
              return (
                <button
                  key={i}
                  type="button"
                  onClick={backspace}
                  aria-label="Backspace"
                  className="w-22.5 h-12 rounded-xl bg-[#DDE2E8] border border-[#D6DCE2] flex items-center justify-center cursor-pointer active:scale-95 transition-transform"
                >
                  <Delete className="w-5 h-5 text-[#0A2E20]" strokeWidth={1.9} />
                </button>
              );
            }
            return (
              <button
                key={i}
                type="button"
                onClick={() => appendDigit(k)}
                className="w-22.5 h-12 rounded-xl bg-[#E8ECEF] border border-white/90 text-[18px] font-extrabold text-[#0A2E20] cursor-pointer active:scale-95 transition-transform"
                style={{ boxShadow: '-3px -3px 7px rgba(255,255,255,0.8), 4px 4px 8px rgba(163,174,187,0.4)' }}
              >
                {k}
              </button>
            );
          })}
        </div>

        {/* ⚡ Instant Demo Access CTA */}
        <button
          type="button"
          onClick={() => void handleDemoAccess()}
          disabled={busy}
          className="absolute left-5 right-5 top-153.75 h-11 rounded-xl bg-[#E8ECEF] border-[1.5px] border-[#09431B] text-[#09431B] text-[13px] font-extrabold cursor-pointer disabled:opacity-60 hover:bg-white active:scale-[0.98] transition-all flex items-center justify-center gap-2"
          style={{ boxShadow: '-3px -3px 7px rgba(255,255,255,0.8), 4px 4px 8px rgba(163,174,187,0.4)' }}
        >
          <Zap className="w-4 h-4 fill-amber-400 text-amber-500" strokeWidth={2.2} />
          <span>⚡ Instant Demo Access</span>
        </button>

        {/* Sign In CTA */}
        <button
          type="button"
          onClick={() => void handleSignIn()}
          disabled={busy}
          className="absolute left-5 right-5 top-167 h-11 rounded-xl bg-[#09431B] text-white text-[14px] font-bold cursor-pointer disabled:opacity-60 hover:bg-[#073515] active:scale-[0.98] transition-all"
          style={{ boxShadow: '-3px -3px 7px rgba(255,255,255,0.8), 4px 4px 8px rgba(163,174,187,0.4)' }}
        >
          {busy ? 'Signing in…' : 'Sign In'}
        </button>

        {/* PIN hint ONLY in demo mode — never written on the door in live mode */}
        {(!isBackendConfigured || (typeof window !== 'undefined' && window.location.search.includes('dev=1'))) && (
          <p className="absolute top-180.5 w-full text-center text-[10px] font-medium text-[#5C7A6D]">
            Demo PIN: 0708 or 1234
          </p>
        )}
      </div>
    </div>
  );
};
