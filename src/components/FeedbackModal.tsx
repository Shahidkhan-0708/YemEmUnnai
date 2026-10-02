import React, { useState } from 'react';
import { X, ThumbsUp, ThumbsDown } from 'lucide-react';
import { submitReview } from '../lib/api';
import { useModalA11y } from '../lib/useModalA11y';
import type { FoodItem } from './HomeDiscoveryScreen';

interface FeedbackModalProps {
  isOpen: boolean;
  item: FoodItem | null;
  onClose: () => void;
  onSubmitSuccess?: () => void;
}

const STAR_OUTER_R = 13.75;
const STAR_INNER_R = 5.5;
const STAR_POINTS = 5;
const STAR_ROTATION = -90; // points up
const STAR_PATHS = Array.from({ length: 5 }, (_, i) => {
  const cx = 61 + i * 59;
  const cy = 376.2;
  const pts: string[] = [];
  for (let p = 0; p < STAR_POINTS * 2; p++) {
    const r = p % 2 === 0 ? STAR_OUTER_R : STAR_INNER_R;
    const a = (Math.PI * 2 * p) / (STAR_POINTS * 2) + (STAR_ROTATION * Math.PI) / 180;
    pts.push(`${(cx + r * Math.cos(a)).toFixed(2)},${(cy + r * Math.sin(a)).toFixed(2)}`);
  }
  return `M${pts.join(' L')} Z`;
});

/**
 * Screen 03 — "Rating & Feedback" bottom sheet, 1:1 from
 * figma_svgs/03_feedback_popup.svg (375 × 812):
 *   - Sheet ......... x=13 y=270 w=349 h=440 rx=27 #E8ECEF, white stroke .85, soft shadow
 *   - Handle ........ 45×4 rx=2 #D6DCE2, 9px from top
 *   - Title ......... "Rating & Feedback" 17px w800 (baseline y=310)
 *   - Subtitle ...... "Help {vendor} improve live batch quality" 11px w600 #7A6658
 *   - Divider ....... y=336 #D6DCE2
 *   - "Rate your stars" 13px w700 (x=32, baseline y=343)
 *   - 5 stars ....... centers (61 + 59·i, 376.2), outer R≈13.75 / inner R≈5.5, fill #EAA02B
 *   - Like row ...... thumb icon @36 (scaled .875, stroke #7A6658) + "Like" 13px w700 (x=65)
 *                     toggle 43×24 rx=12 #ABB8B0, knob d=18 at LEFT (cx=158)
 *   - Dislike ....... same icon rotated 180° @x=235 + "Dislike" (x=264), no toggle
 *   - Comment box ... x=29 y=438 w=317 h=175 rx=16 inset #DCE5E0, "Write your review…" 13px w500 #6B8075
 *   - CTA ........... x=29 y=636 w=317 h=46 rx=12 #F06A05 "Submit Review" 14px w700
 */
export const FeedbackModal: React.FC<FeedbackModalProps> = ({
  isOpen,
  item,
  onClose,
  onSubmitSuccess
}) => {
  const [rating, setRating] = useState(5);
  const [hovered, setHovered] = useState<number | null>(null);
  const [isLiked, setIsLiked] = useState(true);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const sheetRef = useModalA11y<HTMLDivElement>(isOpen && !!item, onClose);

  if (!isOpen || !item) return null;

  const activeCount = hovered ?? rating;

  const handleSubmit = async () => {
    setSubmitting(true);
    setSubmitError(null);

    const ok = await submitReview({
      foodItemId: item.id,
      rating,
      isLiked,
      comment
    });

    setSubmitting(false);

    if (!ok) {
      setSubmitError('Could not submit review. Please try again.');
      return;
    }
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setRating(5);
      setComment('');
      onSubmitSuccess?.();
      onClose();
    }, 1100);
  };

  return (
    <div
      className="absolute inset-0 z-50"
      style={{ background: 'rgba(3, 42, 21, 0.43)' }}
      onClick={onClose}
    >
      {/* Sheet x=13 y=270 w=349 h=440 rx=27 */}
      <div
        ref={sheetRef}
        role="dialog"
        aria-modal="true"
        aria-label={`Rate and review ${item.name}`}
        className="absolute left-3.25 right-3.25 top-67.5 h-110 rounded-[27px] bg-[#E8ECEF] border border-white/60 overflow-hidden animate-in fade-in slide-in-from-bottom-6 duration-200"
        style={{ boxShadow: '-6px -6px 12px rgba(255,255,255,0.85), 6px 6px 12px rgba(163,174,187,0.45)' }}
        onClick={(e) => e.stopPropagation()}
      >
        {submitted ? (
          <div className="h-full flex flex-col items-center justify-center text-center px-4.5">
            <ThumbsUp className="w-14 h-14 text-[#F06A05]" />
            <h3 className="text-[17px] font-extrabold text-[#1F140A] mt-3">Review Published!</h3>
            <p className="text-[11px] font-semibold text-[#7A6658] mt-1">
              Thanks for helping {item.vendor} improve.
            </p>
          </div>
        ) : (
          <div>
            {/* Handle — 45×4, 9px from top */}
            <div className="mx-auto mt-2.25 w-11.25 h-1 rounded-xs bg-[#D6DCE2]" />

            {/* Close X — 18px icon, center (337.5, 304) — 24px hit area */}
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="absolute top-5.25 right-2.5 w-6 h-6 flex items-center justify-center cursor-pointer"
            >
              <X className="w-4.75 h-4.75 text-[#6A8174]" strokeWidth={1.9} />
            </button>

            <div className="px-4.5">
              {/* Title — baseline y=310 */}
              <h2 className="mt-3.5 text-[17px] font-extrabold leading-5.5 text-[#1F140A]">
                Rating &amp; Feedback
              </h2>
              {/* Subtitle — baseline y=327 */}
              <p className="mt-px text-[11px] font-semibold leading-3.5 text-[#7A6658]">
                Help {item.vendor} improve live batch quality
              </p>

              {/* Divider — y=336 */}
              <div className="mt-1.75 h-px bg-[#D6DCE2]" />

              {/* Rate your stars — baseline y=343 */}
              <div className="mt-1.25 text-[13px] font-bold text-[#1F140A]">Rate your stars</div>

              {/* 5 stars — 59px pitch, centers y=376.2, R_out 13.75 / R_in 5.5 */}
              <div className="mt-0.75 flex items-center gap-7.75">
                {[0, 1, 2, 3, 4].map((i) => {
                  const idx = i + 1;
                  const active = idx <= activeCount;
                  return (
                    <button
                      key={i}
                      type="button"
                      aria-label={`Rate ${idx} star${idx > 1 ? 's' : ''}`}
                      onMouseEnter={() => setHovered(idx)}
                      onMouseLeave={() => setHovered(null)}
                      onClick={() => setRating(idx)}
                      className="cursor-pointer"
                    >
                      <svg width="28" height="28" viewBox="0 0 28 28" aria-hidden="true">
                        <path
                          d={STAR_PATHS[i]}
                          transform={`translate(${14 - (61 + i * 59)} ${14 - 376.2})`}
                          fill={active ? '#EAA02B' : '#D6DCE2'}
                          style={{ transition: 'fill 120ms ease' }}
                        />
                      </svg>
                      <span className="sr-only">{active ? 'filled' : 'empty'}</span>
                    </button>
                  );
                })}
              </div>

              {/* Like / Dislike Selector — Two intuitive tactile pill buttons */}
              <div className="mt-5.5 flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setIsLiked(true)}
                  className={`flex-1 h-9.5 rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-all ${
                    isLiked
                      ? 'bg-[#F06A05] text-white btn-orange-shadow font-extrabold'
                      : 'bg-[#E8ECEF] border border-[#D6DCE2] text-[#7A6658] hover:text-[#1F140A]'
                  }`}
                >
                  <ThumbsUp className={`w-4.5 h-4.5 ${isLiked ? 'text-white' : 'text-[#7A6658]'}`} strokeWidth={2} />
                  <span className="text-[13px]">Like</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsLiked(false)}
                  className={`flex-1 h-9.5 rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-all ${
                    !isLiked
                      ? 'bg-[#B4382B] text-white shadow-md font-extrabold'
                      : 'bg-[#E8ECEF] border border-[#D6DCE2] text-[#7A6658] hover:text-[#1F140A]'
                  }`}
                >
                  <ThumbsDown className={`w-4.5 h-4.5 ${!isLiked ? 'text-white' : 'text-[#7A6658]'}`} strokeWidth={2} />
                  <span className="text-[13px]">Dislike</span>
                </button>
              </div>

              {/* Comment box — 317×175 rx=16 inset */}
              <div
                className="mt-6 h-43.75 rounded-2xl bg-[#E8ECEF] border border-[#D6DCE2]"
                style={{ boxShadow: 'inset 3px 3px 6px rgba(154,166,179,0.5), inset -3px -3px 6px rgba(255,255,255,0.85)' }}
              >
                <textarea
                  aria-label="Your review"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Write your review…"
                  maxLength={500}
                  className="w-full h-full resize-none bg-transparent rounded-2xl px-3.75 py-3.25 text-[13px] font-medium text-[#1F140A] placeholder:text-[#6B8075] focus:outline-none"
                />
              </div>

              {submitError && (
                <p role="alert" className="mt-1.5 text-[10px] font-bold text-red-600">{submitError}</p>
              )}

              {/* CTA — 317×46 rx=12 #F06A05 */}
              <button
                type="button"
                onClick={handleSubmit}
                disabled={submitting}
                className="mt-4 w-full h-11.5 rounded-xl bg-[#F06A05] text-white text-[14px] font-bold cursor-pointer disabled:opacity-60 hover:bg-[#E05D00] active:scale-[0.98] transition-all"
                style={{ boxShadow: '-3px -3px 7px rgba(255,255,255,0.8), 4px 4px 8px rgba(163,174,187,0.4)' }}
              >
                {submitting ? 'Publishing…' : 'Submit Review'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
