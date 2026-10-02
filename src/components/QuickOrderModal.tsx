import { useRef, useState } from 'react';
import { X, CheckCircle, Minus, Plus, LoaderCircle } from 'lucide-react';
import { placeOrder } from '../lib/api';
import { useModalA11y } from '../lib/useModalA11y';
import { playSuccessChime, fireOrderConfetti } from '../lib/celebration';
import type { FoodItem } from '../lib/types';

export interface OrderSuccessData { token: string; orderId?: string; vendor: string; status: string }
interface QuickOrderModalProps {
  isOpen: boolean; item: FoodItem | null; initialQty?: number;
  onClose: () => void; onSuccess?: (data: OrderSuccessData) => void;
}

export function QuickOrderModal({ isOpen, item, initialQty = 1, onClose, onSuccess }: QuickOrderModalProps) {
  const [qty, setQty] = useState(() => Math.max(1, Math.min(10, initialQty)));
  const [mobile, setMobile] = useState('');
  const [address, setAddress] = useState('');
  const [token, setToken] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const lock = useRef(false);
  const root = useModalA11y<HTMLDivElement>(isOpen && !!item, () => { if (!lock.current) onClose(); });
  if (!isOpen || !item) return null;
  const available = item.inStock && item.isShopOnline !== false && item.price > 0;
  const confirm = async (event: React.FormEvent) => {
    event.preventDefault();
    if (lock.current) return;
    if (!available) { setError('This item is unavailable. Close this sheet and choose another item.'); return; }
    lock.current = true; setBusy(true); setError(null);
    try {
      const result = await placeOrder({ foodItem: item, quantity: qty, mobile: mobile.trim(), address: address.trim() });
      if (!result.success || !result.token) { setError(result.reason || 'Unable to send your order. Check your connection and try again.'); return; }
      setToken(result.token);
      onSuccess?.({ token: result.token, orderId: result.orderId, vendor: item.vendor, status: 'Sent to shop' });
      playSuccessChime(); fireOrderConfetti();
      if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) navigator.vibrate?.(35);
    } catch { setError('Unable to send your order. Check your connection and try again.'); }
    finally { lock.current = false; setBusy(false); }
  };
  return (
    <div className="consumer-ui campus-overlay" onClick={() => { if (!lock.current) onClose(); }}>
      <div ref={root} role="dialog" aria-modal="true" aria-labelledby="order-title" className="campus-sheet" onClick={e => e.stopPropagation()}>
        <div className="sheet-handle" aria-hidden="true" />
        <header className="sheet-header"><div><p className="campus-eyebrow">{token ? 'Keep this number handy' : 'No account needed'}</p><h2 id="order-title">{token ? 'Token pinned' : 'Grab your next bite'}</h2></div>
          <button className="campus-icon" disabled={busy} onClick={onClose} aria-label="Close order"><X aria-hidden="true" /></button></header>
        <div role="status" className={token ? 'order-success' : 'sr-only'}>{token && <><CheckCircle size={40} aria-hidden="true" /><span className="token-number">#{token}</span><p>Sent to {item.vendor}.</p><p className="campus-muted">Check the live status above. Show your token at the shop.</p></>}</div>
        {token ? <button className="campus-primary" onClick={onClose}>Back to the menu</button> : <form onSubmit={confirm}>
          <fieldset disabled={busy}>
            <div className="order-summary campus-surface"><div><strong>{item.name}</strong><p className="campus-muted">{item.vendor}</p></div><strong className="campus-price">₹{item.price * qty}</strong></div>
            <div className="quantity-row"><span>Quantity</span><div className="campus-stepper">
              <button type="button" aria-label="Decrease quantity" disabled={qty <= 1} onClick={() => setQty(q => q - 1)}><Minus size={18} aria-hidden="true" /></button><output aria-label="Quantity">{qty}</output>
              <button type="button" aria-label="Increase quantity" disabled={qty >= 10} onClick={() => setQty(q => q + 1)}><Plus size={18} aria-hidden="true" /></button></div></div>
            <label htmlFor="quick-order-mobile">Mobile number</label>
            <p id="mobile-hint" className="field-hint">So the shop can reach you about your order.</p>
            <input id="quick-order-mobile" name="tel" type="tel" inputMode="tel" autoComplete="tel-national" required pattern="[6-9][0-9]{9}" maxLength={10} title="Enter a 10-digit Indian mobile number" placeholder="9876543210" value={mobile} onChange={e => setMobile(e.target.value)} aria-describedby="mobile-hint" />
            <label htmlFor="quick-order-address">Campus location</label>
            <p id="location-hint" className="field-hint">Share a block or landmark. The shop will confirm arrangements.</p>
            <input id="quick-order-address" name="address" autoComplete="street-address" required minLength={2} maxLength={160} placeholder="Main block, room 204" value={address} onChange={e => setAddress(e.target.value)} aria-describedby="location-hint" />
          </fieldset>
          {error && <p role="alert" className="campus-error">{error}</p>}
          <p className="checkout-note campus-muted">Payment and collection are handled by the shop.</p>
          <button className="campus-primary" type="submit" disabled={busy || !available}>{busy && <LoaderCircle size={18} className="animate-spin" aria-hidden="true" />}{busy ? 'Sending order…' : available ? `Send order · ₹${item.price * qty}` : 'Item unavailable'}</button>
        </form>}
      </div>
    </div>
  );
}
