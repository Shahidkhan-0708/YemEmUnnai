import React, { useState, useRef, useEffect } from 'react';
import { Bell, ArrowRight, Check, X } from 'lucide-react';
import { playTapSound, playSuccessChime } from '../lib/celebration';

export interface MorphingButtonProps {
  buttonText?: string;
  onSubmit?: (email: string) => void;
  placeholder?: string;
  className?: string;
  successMessage?: string;
}

export const MorphingButton: React.FC<MorphingButtonProps> = ({
  buttonText = 'Notify Me',
  onSubmit,
  placeholder = 'Enter your email…',
  className = '',
  successMessage = 'Subscribed!',
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isExpanded && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isExpanded]);

  const handleExpand = () => {
    playTapSound();
    setIsExpanded(true);
  };

  const handleClose = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    playTapSound();
    setIsExpanded(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) return;

    playSuccessChime();
    setIsSubmitted(true);
    onSubmit?.(email);

    setTimeout(() => {
      setIsSubmitted(false);
      setIsExpanded(false);
      setEmail('');
    }, 2000);
  };

  if (isSubmitted) {
    return (
      <div className={`inline-flex items-center gap-1.5 h-10 px-4 rounded-xl bg-emerald-500 text-white text-xs font-bold shadow-md animate-in zoom-in-95 duration-200 ${className}`}>
        <Check className="w-4 h-4 stroke-[2.5]" />
        <span>{successMessage}</span>
      </div>
    );
  }

  if (isExpanded) {
    return (
      <form
        onSubmit={handleSubmit}
        className={`inline-flex items-center h-10 bg-white border border-[#F06A05] rounded-xl shadow-lg p-1 transition-all duration-300 animate-in fade-in zoom-in-95 ${className}`}
      >
        <input
          ref={inputRef}
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={placeholder}
          className="w-44 px-2.5 py-1 text-xs font-semibold text-[#1F140A] placeholder-[#7A6658] bg-transparent outline-none"
        />
        <button
          type="submit"
          disabled={!email}
          aria-label="Submit"
          className="w-8 h-8 rounded-lg bg-[#F06A05] hover:bg-[#E05D00] text-white flex items-center justify-center shrink-0 transition-all active:scale-95 disabled:opacity-40 cursor-pointer"
        >
          <ArrowRight className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={handleClose}
          aria-label="Cancel"
          className="w-7 h-7 rounded-lg text-[#7A6658] hover:text-[#1F140A] flex items-center justify-center shrink-0 ml-0.5 cursor-pointer"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </form>
    );
  }

  return (
    <button
      type="button"
      onClick={handleExpand}
      className={`inline-flex items-center justify-center gap-1.5 h-10 px-4 rounded-xl bg-[#F06A05] hover:bg-[#E05D00] text-white text-xs font-extrabold btn-orange-shadow transition-all duration-200 active:scale-97 cursor-pointer ${className}`}
    >
      <Bell className="w-3.5 h-3.5" />
      <span>{buttonText}</span>
    </button>
  );
};

export default MorphingButton;
