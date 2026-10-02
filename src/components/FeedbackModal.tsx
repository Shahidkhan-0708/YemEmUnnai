import { useRef, useState } from 'react';
import { X, Star, CheckCircle } from 'lucide-react';
import { submitReview } from '../lib/api';
import { useModalA11y } from '../lib/useModalA11y';
import type { FoodItem } from '../lib/types';
interface FeedbackModalProps { isOpen: boolean; item: FoodItem | null; onClose: () => void; onSubmitSuccess?: () => void }
export function FeedbackModal({ isOpen, item, onClose, onSubmitSuccess }: FeedbackModalProps) {
  const [rating, setRating] = useState(5);
  const [liked, setLiked] = useState(true);
  const [comment, setComment] = useState('');
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const lock = useRef(false);
  const root = useModalA11y<HTMLDivElement>(isOpen && !!item, () => { if (!lock.current) onClose(); });
  if (!isOpen || !item) return null;
  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (lock.current) return;
    lock.current = true; setBusy(true); setError(null);
    try {
      const ok = await submitReview({ foodItemId:item.id, rating, isLiked:liked, comment:comment.trim() });
      if (!ok) { setError('Unable to send your review. Check your connection and try again.'); return; }
      setSent(true); onSubmitSuccess?.();
    } catch { setError('Unable to send your review. Check your connection and try again.'); }
    finally { lock.current = false; setBusy(false); }
  };
  return <div className="consumer-ui campus-overlay" onClick={() => { if (!lock.current) onClose(); }}>
    <div ref={root} role="dialog" aria-modal="true" aria-labelledby="review-title" className="campus-sheet" onClick={e => e.stopPropagation()}>
      <div className="sheet-handle" aria-hidden="true" />
      <header className="sheet-header"><div><p className="campus-eyebrow">{item.vendor}</p><h2 id="review-title">Rate {item.name}</h2></div><button className="campus-icon" disabled={busy} onClick={onClose} aria-label="Close review"><X aria-hidden="true" /></button></header>
      <div role="status" className={sent ? 'order-success' : 'sr-only'}>{sent && <><CheckCircle size={40} aria-hidden="true" /><h3>Review sent</h3><p className="campus-muted">Thanks for helping the next hungry student.</p></>}</div>
      {sent ? <button className="campus-primary" onClick={onClose}>Back to the menu</button> : <form onSubmit={submit}><fieldset disabled={busy}>
        <legend className="font-bold">Rating</legend><div className="review-stars">{[1,2,3,4,5].map(value => <button key={value} type="button" aria-label={`Rate ${value} ${value === 1 ? 'star' : 'stars'}`} aria-pressed={rating === value} onClick={() => setRating(value)}><Star size={24} aria-hidden="true" fill={value <= rating ? 'currentColor' : 'none'} /></button>)}</div>
        <p className="campus-muted">{rating} out of 5</p>
        <div className="map-actions" role="group" aria-label="Food reaction"><button type="button" aria-pressed={liked} onClick={() => setLiked(true)}>Like</button><button type="button" aria-pressed={!liked} onClick={() => setLiked(false)}>Dislike</button></div>
        <label htmlFor="review-comment">Review <span className="campus-muted">(optional)</span></label><textarea id="review-comment" name="review" rows={4} maxLength={1000} placeholder="What should the next student know?" value={comment} onChange={e => setComment(e.target.value)} />
      </fieldset>{error && <p role="alert" className="campus-error">{error}</p>}<button type="submit" className="campus-primary mt-5" disabled={busy}>{busy ? 'Sending review…' : 'Send review'}</button></form>}
    </div>
  </div>;
}
