import React, { useState } from 'react';
import { X, AlertCircle, Delete } from 'lucide-react';
import { useVendorSession } from '../lib/hooks';
import { useModalA11y } from '../lib/useModalA11y';
import { isBackendConfigured } from '../lib/supabase';

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
  const { signIn } = useVendorSession();
  const [role, setRole] = useState<'student' | 'vendor'>('vendor');
  const [rollNumber, setRollNumber] = useState('');
  const [pin, setPin] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const rootRef = useModalA11y<HTMLDivElement>(isOpen, onClose);

  if (!isOpen) return null;

  const appendDigit = (d: string) => {
    if (role === 'student') {
      setRollNumber(prev => (prev.length >= 10 ? prev : prev + d));
    } else {
      setPin(prev => (prev.length >= 4 ? prev : prev + d));
    }
  };

  const backspace = () => {
    if (role === 'student') setRollNumber(prev => prev.slice(0, -1));
    else setPin(prev => prev.slice(0, -1));
  };

  const handleSignIn = async () => {
    if (role !== 'vendor') {
      setError('Student sign-in needs Supabase configured. Vendors can sign in now.');
      return;
    }
    setBusy(true);
    setError(null);
    const res = await signIn(rollNumber, pin);
    setBusy(false);
    if (!res.ok) {
      setError(res.error ?? 'Sign-in failed');
      return;
    }
    onClose();
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
      <div className="relative w-full h-full max-w-[390px] mx-auto min-h-[820px]">
        {/* Header — back circle at (20,36) r18, title baseline y=59 */}
        <div className="absolute left-[20px] top-[36px] flex items-center">
          <button
            type="button"
            onClick={onClose}
            aria-label="Back"
            className="w-[36px] h-[36px] rounded-full bg-[#E8ECEF] border border-white flex items-center justify-center cursor-pointer"
            style={{ boxShadow: '-3px -3px 7px rgba(255,255,255,0.8), 4px 4px 8px rgba(163,174,187,0.4)' }}
          >
            <X className="w-[18px] h-[18px] text-[#0A2E20]" strokeWidth={2.2} />
          </button>
          <span className="absolute left-[167px] w-full text-[14px] font-extrabold text-[#0A2E20]">
            Campus Access
          </span>
        </div>

        {/* Mascot — 76px ring, center (187.5,120) */}
        <div className="absolute left-1/2 -translate-x-1/2 top-[82px] w-[76px] h-[76px] rounded-full bg-[#0A461E] flex items-center justify-center"
          style={{ boxShadow: '-3px -3px 7px rgba(255,255,255,0.8), 4px 4px 8px rgba(163,174,187,0.4)' }}
        >
          <div className="w-[70px] h-[70px] rounded-full bg-[#E8ECEF] overflow-hidden flex items-center justify-center">
            <img src="/images/mascot.png" alt="YEMEMUNNAI mascot" className="w-[66px] h-[66px] object-contain" />
          </div>
        </div>

        {/* Welcome — baselines y=180 / y=198 */}
        <h2 className="absolute top-[164px] w-full text-center text-[18px] font-extrabold text-[#0A2E20]">
          Welcome to YEMEMUNNAI!
        </h2>
        <p className="absolute top-[188px] w-full text-center text-[11px] font-semibold text-[#5C7A6D]">
          Instant food discovery for MITS students &amp; faculty
        </p>

        {/* Role tabs — 335×42 rx=12 at (20,215) */}
        <div className="absolute left-[20px] right-[20px] top-[215px] h-[42px] rounded-[12px] bg-[#E8ECEF] border border-[#D6DCE2] p-[3px] flex">
          <button
            type="button"
            onClick={() => setRole('student')}
            aria-pressed={role === 'student'}
            className={`relative h-[36px] rounded-[10px] text-[12px] cursor-pointer transition-all ${
              role === 'student' ? 'w-[164px] font-extrabold text-white' : 'flex-1 font-bold text-[#5C7A6D]'
            }`}
            style={role === 'student' ? { background: '#09431B', boxShadow: '-3px -3px 7px rgba(255,255,255,0.8), 4px 4px 8px rgba(163,174,187,0.4)' } : undefined}
          >
            Student / Faculty
          </button>
          <button
            type="button"
            onClick={() => setRole('vendor')}
            aria-pressed={role === 'vendor'}
            className={`relative h-[36px] rounded-[10px] text-[12px] cursor-pointer transition-all ${
              role === 'vendor' ? 'w-[164px] font-extrabold text-white' : 'flex-1 font-bold text-[#5C7A6D]'
            }`}
            style={role === 'vendor' ? { background: '#09431B', boxShadow: '-3px -3px 7px rgba(255,255,255,0.8), 4px 4px 8px rgba(163,174,187,0.4)' } : undefined}
          >
            Canteen Vendor
          </button>
        </div>

        {/* ID field — label baseline y=275, box y=287 335×50 rx=12 */}
        <span className="absolute left-[24px] top-[266px] text-[10px] font-extrabold tracking-[0.8px] text-[#0A2E20]">
          {role === 'student' ? 'CAMPUS ROLL NUMBER / MOBILE' : 'VENDOR EMAIL'}
        </span>
        <div
          className="absolute left-[20px] right-[20px] top-[287px] h-[50px] rounded-[12px] bg-[#E8ECEF] flex items-center px-[18px]"
          style={{
            border: '1.8px solid #09431B',
            boxShadow: 'inset 3px 3px 6px rgba(154,166,179,0.5), inset -3px -3px 6px rgba(255,255,255,0.85)'
          }}
        >
          <input
            type="text"
            value={role === 'student' ? rollNumber : rollNumber}
            onChange={(e) => setRollNumber(e.target.value)}
            placeholder={role === 'student' ? '22691A0589' : 'vendor@yememunnai.app'}
            className="flex-1 bg-transparent text-[15px] font-extrabold tracking-[1px] text-[#0A2E20] placeholder:text-[#6B8075]/60 placeholder:font-medium focus:outline-none"
          />
          {/* Caret */}
          <span className="w-[2px] h-[18px] bg-[#09431B] mr-[12px] animate-pulse" />
          {/* Verified badge — 22px circle #10B981 + check */}
          {rollNumber.length >= 4 && (
            <span className="w-[22px] h-[22px] rounded-full bg-[#10B981] flex items-center justify-center shrink-0">
              <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden>
                <path d="M3.5 7 L6 9.5 L10.5 4" fill="none" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </span>
          )}
        </div>

        {/* PIN — label baseline y=360, boxes y=372: 74×50 rx=12, gaps 13px */}
        <span className="absolute left-[24px] top-[351px] text-[10px] font-extrabold tracking-[0.8px] text-[#0A2E20]">
          CAMPUS SECURITY PIN
        </span>
        <div className="absolute left-[20px] right-[20px] top-[372px] flex gap-[13px]">
          {[0, 1, 2, 3].map((i) => {
            const digit = pin[i] ?? '';
            const isActive = i === pin.length;
            return (
              <div
                key={i}
                className="flex-1 h-[50px] rounded-[12px] bg-[#E8ECEF] flex items-center justify-center"
                style={{
                  border: isActive ? '1.8px solid #09431B' : '1px solid #CAD8D0',
                  boxShadow: 'inset 3px 3px 6px rgba(154,166,179,0.5), inset -3px -3px 6px rgba(255,255,255,0.85)'
                }}
              >
                {digit ? (
                  <span className="text-[20px] font-extrabold text-[#0A2E20]">{digit}</span>
                ) : isActive ? (
                  <span className="w-[8px] h-[8px] rounded-full bg-[#09431B]" />
                ) : null}
              </div>
            );
          })}
        </div>

        {/* Error line */}
        {error && (
          <div
            role="alert"
            className="absolute left-[24px] right-[24px] top-[430px] flex items-center gap-1.5 text-[10px] font-bold text-red-600"
          >
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {!isBackendConfigured && role === 'student' && (
          <p className="absolute left-[24px] right-[24px] top-[430px] text-[9px] text-amber-700 font-bold">
            Demo mode — student sign-in requires Supabase keys.
          </p>
        )}

        {/* Numpad — at (35,445): keys 90×52 rx=12, col gap 17, row gap 8 */}
        <div className="absolute left-[35px] top-[445px] grid grid-cols-3 gap-x-[17px] gap-y-[8px]">
          {numpadKeys.map((k, i) => {
            if (k === '') return <span key={i} />;
            if (k === '⌫') {
              return (
                <button
                  key={i}
                  type="button"
                  onClick={backspace}
                  aria-label="Backspace"
                  className="w-[90px] h-[52px] rounded-[12px] bg-[#DDE2E8] border border-[#D6DCE2] flex items-center justify-center cursor-pointer active:scale-95 transition-transform"
                >
                  <Delete className="w-[20px] h-[20px] text-[#0A2E20]" strokeWidth={1.9} />
                </button>
              );
            }
            return (
              <button
                key={i}
                type="button"
                onClick={() => appendDigit(k)}
                className="w-[90px] h-[52px] rounded-[12px] bg-[#E8ECEF] border border-white/90 text-[18px] font-extrabold text-[#0A2E20] cursor-pointer active:scale-95 transition-transform"
                style={{ boxShadow: '-3px -3px 7px rgba(255,255,255,0.8), 4px 4px 8px rgba(163,174,187,0.4)' }}
              >
                {k}
              </button>
            );
          })}
        </div>

        {/* Sign In CTA — styled to the pack (below numpad, 12px radius) */}
        <button
          type="button"
          onClick={() => void handleSignIn()}
          disabled={busy}
          className="absolute left-[20px] right-[20px] top-[718px] h-[47px] rounded-[12px] bg-[#09431B] text-white text-[14px] font-bold cursor-pointer disabled:opacity-60 hover:bg-[#073515] active:scale-[0.98] transition-all"
          style={{ boxShadow: '-3px -3px 7px rgba(255,255,255,0.8), 4px 4px 8px rgba(163,174,187,0.4)' }}
        >
          {busy ? 'Signing in…' : 'Sign In'}
        </button>

        {/* Demo hint */}
        <p className="absolute top-[770px] w-full text-center text-[9px] font-medium text-[#5C7A6D]">
          Demo vendor: vendor@yememunnai.app / yememunnai123
        </p>
      </div>
    </div>
  );
};
