import React, { useState } from 'react';
import { X, ThumbsUp, ThumbsDown } from 'lucide-react';
import { submitReview } from '../lib/api';
import { useModalA11y } from '../lib/useModalA11y';
import type { FoodItem } from '../lib/types';
import { toast } from './ui/sonner';

interface FeedbackModalProps {
  isOpen: boolean;
  item: FoodItem | null;
  onClose: () => void;
  onSubmitSuccess?: () => void;
}

const STAR_PATHS = [
  'M74.75 365.2l2.42 4.9 5.41.79-3.91 3.82.92 5.39-4.84-2.54-4.84 2.54.92-5.39-3.91-3.82 5.41-.79z',
  'M133.75 365.2l2.42 4.9 5.41.79-3.91 3.82.92 5.39-4.84-2.54-4.84 2.54.92-5.39-3.91-3.82 5.41-.79z',
  'M192.75 365.2l2.42 4.9 5.41.79-3.91 3.82.92 5.39-4.84-2.54-4.84 2.54.92-5.39-3.91-3.82 5.41-.79z',
  'M251.75 365.2l2.42 4.9 5.41.79-3.91 3.82.92 5.39-4.84-2.54-4.84 2.54.92-5.39-3.91-3.82 5.41-.79z',
  'M310.75 365.2l2.42 4.9 5.41.79-3.91 3.82.92 5.39-4.84-2.54-4.84 2.54.92-5.39-3.91-3.82 5.41-.79z'
];

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
      toast.error('Could not submit review. Please try again.');
      return;
    }
    setSubmitted(true);
    toast.success('Review published! Thank you for the feedback.');
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
      className="absolute inset-0 z-50 flex flex-col justify-end bg-black/60 backdrop-blur-xs select-none animate-in fade-in duration-200"
      onClick={onClose}
    >
      {/* Bottom Sheet Modal */}
      <div
        ref={sheetRef}
        role="dialog"
        aria-modal="true"
        aria-label={`Rate and review ${item.name}`}
        className="w-full max-h-[92%] flex flex-col rounded-t-[32px] bg-[#E8ECEF] border-t border-x border-white/70 shadow-2xl animate-in slide-in-from-bottom duration-200 overflow-hidden font-sans relative"
        style={{
          boxShadow: '0 -10px 30px rgba(0,0,0,0.3), -4px -4px 10px rgba(255,255,255,0.7)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {submitted ? (
          <div className="py-12 flex flex-col items-center justify-center text-center px-6 animate-in zoom-in-95 duration-200">
            <ThumbsUp className="w-14 h-14 text-[#F06A05] animate-bounce" />
            <h3 className="text-xl font-extrabold text-[#1F140A] mt-3">Review Published!</h3>
            <p className="text-xs font-semibold text-[#7A6658] mt-1.5 leading-relaxed">
              Thanks for helping {item.vendor} improve live batch quality.
            </p>
          </div>
        ) : (
          <div className="flex flex-col max-h-full min-h-0">
            {/* Header: drag bar + close button + titles */}
            <div className="px-5 pt-3 pb-2 border-b border-[#D6DCE2]/60 shrink-0 relative">
              <div className="py-1 flex justify-center">
                <div className="w-12 h-1.5 rounded-full bg-[#CBD5E1]" />
              </div>

              {/* Close Button */}
              <button
                type="button"
                onClick={onClose}
                aria-label="Close"
                className="absolute top-3 right-4 w-8 h-8 rounded-full bg-white/80 hover:bg-white border border-[#D6DCE2] flex items-center justify-center text-[#7A6658] hover:text-[#1F140A] active:scale-90 transition-all cursor-pointer shadow-xs"
              >
                <X className="w-4 h-4 stroke-[2.2]" />
              </button>

              <h2 className="mt-2 text-lg font-extrabold text-[#1F140A] tracking-tight">
                Rating &amp; Feedback
              </h2>
              <p className="text-xs font-semibold text-[#7A6658] mt-0.5">
                Help {item.vendor} improve live batch quality
              </p>
            </div>

            {/* Scrollable Content Body */}
            <div className="flex-1 overflow-y-auto overscroll-contain px-5 py-4 space-y-4 min-h-0">
              {/* Star Rating Section */}
              <div>
                <span className="block text-xs font-bold text-[#1F140A] mb-2">Rate your stars</span>
                <div className="flex items-center justify-between px-2 py-1">
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
                        className="cursor-pointer p-1 active:scale-90 transition-transform"
                      >
                        <svg width="32" height="32" viewBox="0 0 28 28" aria-hidden="true">
                          <path
                            d={STAR_PATHS[i]}
                            transform={`translate(${14 - (61 + i * 59)} ${14 - 376.2})`}
                            fill={active ? '#EAA02B' : '#CBD5E1'}
                            style={{ transition: 'fill 120ms ease' }}
                          />
                        </svg>
                        <span className="sr-only">{active ? 'filled' : 'empty'}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Like / Dislike Selector */}
              <div>
                <span className="block text-xs font-bold text-[#1F140A] mb-2">Recommendation</span>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setIsLiked(true)}
                    className={`flex-1 h-10 rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-all ${
                      isLiked
                        ? 'bg-[#F06A05] text-white btn-orange-shadow font-extrabold'
                        : 'bg-[#E8ECEF] border border-[#D6DCE2] text-[#7A6658] hover:text-[#1F140A]'
                    }`}
                  >
                    <ThumbsUp className={`w-4 h-4 ${isLiked ? 'text-white' : 'text-[#7A6658]'}`} strokeWidth={2.2} />
                    <span className="text-xs">Liked it</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsLiked(false)}
                    className={`flex-1 h-10 rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-all ${
                      !isLiked
                        ? 'bg-rose-600 text-white shadow-md font-extrabold'
                        : 'bg-[#E8ECEF] border border-[#D6DCE2] text-[#7A6658] hover:text-[#1F140A]'
                    }`}
                  >
                    <ThumbsDown className={`w-4 h-4 ${!isLiked ? 'text-white' : 'text-[#7A6658]'}`} strokeWidth={2.2} />
                    <span className="text-xs">Needs Improvement</span>
                  </button>
                </div>
              </div>

              {/* Comment text area */}
              <div>
                <label htmlFor="feedback-comment" className="block text-xs font-bold text-[#1F140A] mb-1.5">
                  Your Comments
                </label>
                <div
                  className="h-28 rounded-2xl bg-[#E8ECEF] border border-[#D6DCE2]"
                  style={{ boxShadow: 'inset 2px 2px 5px rgba(154,166,179,0.45), inset -2px -2px 5px rgba(255,255,255,0.85)' }}
                >
                  <textarea
                    id="feedback-comment"
                    aria-label="Your review"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Tell us what you liked or how they can improve…"
                    maxLength={500}
                    className="w-full h-full resize-none bg-transparent rounded-2xl p-3.5 text-xs font-medium text-[#1F140A] placeholder:text-[#94A3B8] focus:outline-none"
                  />
                </div>
              </div>

              {submitError && (
                <p role="alert" className="text-xs font-bold text-rose-600">{submitError}</p>
              )}
            </div>

            {/* Sticky Footer: Submit Button */}
            <div className="p-4 pt-3 pb-5 bg-[#E8ECEF] border-t border-[#D6DCE2]/60 shrink-0">
              <button
                type="button"
                onClick={handleSubmit}
                disabled={submitting}
                className="w-full h-12 rounded-xl bg-[#F06A05] hover:bg-[#D85800] text-white text-sm font-extrabold cursor-pointer disabled:opacity-60 btn-orange-shadow active:scale-[0.98] transition-all flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Publishing…</span>
                  </>
                ) : (
                  'Submit Review'
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FeedbackModal;
