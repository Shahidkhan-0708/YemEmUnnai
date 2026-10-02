import { useEffect, useRef, useState } from 'react';
import { X, AlertCircle, Delete } from 'lucide-react';
import { useVendorSession } from '../lib/hooks';
import { useModalA11y } from '../lib/useModalA11y';
import { VENDOR_OUTLETS } from '../lib/vendorAuth';

interface VendorLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function VendorLoginModal({ isOpen, onClose }: VendorLoginModalProps) {
  const { signInWithOutlet } = useVendorSession();
  const [outletId, setOutletId] = useState(VENDOR_OUTLETS[0].id);
  const [pin, setPin] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [retryAt, setRetryAt] = useState<Record<string, number>>({});
  const [now, setNow] = useState(() => Date.now());
  const inFlight = useRef(false);
  const generation = useRef(0);
  const rootRef = useModalA11y<HTMLDivElement>(isOpen, () => { if (!inFlight.current) onClose(); });
  const retrySeconds = Math.max(0, Math.ceil(((retryAt[outletId] ?? 0) - now) / 1000));

  useEffect(() => {
    generation.current++;
    setPin('');
    setError(null);
    if (!isOpen) return;
    setNow(Date.now());
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => { clearInterval(timer); generation.current++; };
  }, [isOpen]);

  const attemptPin = async (candidate: string) => {
    if (inFlight.current || retrySeconds > 0 || !/^\d{4}$/.test(candidate)) return;
    inFlight.current = true;
    setBusy(true);
    setError(null);
    const current = generation.current;
    try {
      const result = await signInWithOutlet(outletId, candidate);
      if (current !== generation.current) return;
      if (result.ok) onClose();
      else {
        setError(result.error ?? 'Unable to sign in. Please try again.');
        setPin('');
        if (result.retrySeconds) {
          const timestamp = Date.now();
          setNow(timestamp);
          setRetryAt(previous => ({ ...previous, [outletId]: timestamp + result.retrySeconds! * 1000 }));
        }
      }
    } catch {
      if (current === generation.current) {
        setError('Unable to connect. Please try again.');
        setPin('');
      }
    } finally {
      inFlight.current = false;
      setBusy(false);
    }
  };

  const updatePin = (value: string) => {
    if (inFlight.current || retrySeconds > 0) return;
    const candidate = value.replace(/\D/g, '').slice(0, 4);
    setPin(candidate);
    setError(null);
    if (candidate.length === 4) void attemptPin(candidate);
  };

  if (!isOpen) return null;
  const disabled = busy || retrySeconds > 0;

  return (
    <div ref={rootRef} role="dialog" aria-modal="true" aria-labelledby="vendor-login-title"
      className="fixed inset-0 z-50 overflow-y-auto bg-[#E8ECEF] text-[#0A2E20]">
      <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col px-5 py-6 sm:py-9">
        <header className="flex items-center gap-3">
          <button type="button" onClick={onClose} aria-label="Close login" disabled={busy}
            className="flex size-11 items-center justify-center rounded-full tactile-card disabled:opacity-50">
            <X className="size-5" />
          </button>
          <span className="text-sm font-extrabold">Business Portal</span>
        </header>
        <img src="/images/logo.png" alt="YEMUNNAI" className="mx-auto mt-5 size-18 rounded-full bg-[#062814] object-contain p-1" />
        <h2 id="vendor-login-title" className="mt-4 text-center text-xl font-extrabold">Cafe Vendor Login</h2>
        <p className="mt-2 text-center text-sm text-[#5C7A6D]">Select your cafe and enter its four-digit PIN.</p>
        <form className="mt-6 flex flex-1 flex-col" onSubmit={event => { event.preventDefault(); void attemptPin(pin); }}>
          <label htmlFor="vendor-outlet" className="text-xs font-bold">CANTEEN OUTLET</label>
          <select id="vendor-outlet" value={outletId} disabled={busy}
            onChange={event => { setOutletId(event.target.value); setPin(''); setError(null); }}
            className="mt-2 h-12 w-full min-w-0 rounded-xl tactile-inset px-3 text-sm font-bold">
            {VENDOR_OUTLETS.map(outlet => <option key={outlet.id} value={outlet.id}>{outlet.name}</option>)}
          </select>
          <label htmlFor="vendor-pin" className="mt-5 text-xs font-bold">SECURITY PIN (4 DIGITS)</label>
          <input id="vendor-pin" type="password" inputMode="numeric" autoComplete="off" maxLength={4}
            pattern="[0-9]{4}" required value={pin} disabled={disabled} onChange={event => updatePin(event.target.value)}
            aria-describedby="vendor-login-message"
            className="mt-2 h-12 w-full rounded-xl tactile-inset px-4 text-center text-2xl tracking-[0.75em]" />
          <div id="vendor-login-message" className="mt-3 min-h-10 text-sm" aria-live="polite">
            {retrySeconds > 0 ? <p role="alert" className="text-red-700">Too many attempts. Try again in {Math.floor(retrySeconds / 60)}:{String(retrySeconds % 60).padStart(2, '0')}.</p>
              : error ? <p role="alert" className="flex items-start gap-2 text-red-700"><AlertCircle className="size-4 shrink-0 mt-0.5" />{error}</p>
              : <p className="text-[#5C7A6D]">Sign-in starts after the fourth digit.</p>}
          </div>
          <div className="mt-2 grid grid-cols-3 gap-3" aria-label="PIN keypad">
            {['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', 'delete'].map(key => key === '' ? <span key="space" /> :
              <button key={key} type="button" disabled={disabled} aria-label={key === 'delete' ? 'Delete last digit' : key}
                onClick={() => updatePin(key === 'delete' ? pin.slice(0, -1) : pin + key)}
                className="flex h-12 items-center justify-center rounded-xl tactile-card text-xl font-extrabold disabled:opacity-50 active:scale-95">
                {key === 'delete' ? <Delete className="size-5" /> : key}
              </button>)}
          </div>
          <button type="submit" disabled={disabled || pin.length !== 4}
            className="mt-6 min-h-12 rounded-xl bg-[#09431B] px-4 py-3 text-sm font-bold text-white disabled:opacity-50">
            {busy ? 'Signing in…' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
}
