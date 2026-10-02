'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Fingerprint, Check, X } from 'lucide-react';
import { playTapSound, playSuccessChime } from '../lib/celebration';

export interface FamilyReceiveComponentProps {
  triggerLabel?: string;
  title?: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  icon?: React.ReactNode;
  onConfirm?: () => void;
  onCancel?: () => void;
  className?: string;
  variant?: 'primary' | 'orange' | 'neumorphic';
  disabled?: boolean;
}

export const FamilyReceiveComponent: React.FC<FamilyReceiveComponentProps> = ({
  triggerLabel = 'Receive',
  title = 'Confirm',
  description = 'Are you sure you want to proceed?',
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  icon,
  onConfirm,
  onCancel,
  className = '',
  variant = 'primary',
  disabled = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);
  const confirmBtnRef = useRef<HTMLButtonElement>(null);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        handleClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      confirmBtnRef.current?.focus();
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const handleOpen = () => {
    if (disabled) return;
    playTapSound();
    setIsOpen(true);
  };

  const handleClose = () => {
    playTapSound();
    setIsOpen(false);
    onCancel?.();
  };

  const handleConfirm = () => {
    setIsProcessing(true);
    playTapSound();

    setTimeout(() => {
      playSuccessChime();
      setIsProcessing(false);
      setIsOpen(false);
      onConfirm?.();
    }, 450);
  };

  return (
    <>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={handleOpen}
        disabled={disabled}
        className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-xs font-extrabold transition-all duration-150 active:scale-97 cursor-pointer select-none disabled:opacity-50 disabled:cursor-not-allowed ${
          variant === 'primary' || variant === 'orange'
            ? 'bg-[#FE7200] text-white hover:bg-[#E05D00] btn-orange-shadow'
            : 'bg-[#E8ECEF] text-[#1F140A] border border-[#D6DCE2] tactile-card hover:bg-[#DDE2E8]'
        } ${className}`}
      >
        <span className="shrink-0 flex items-center justify-center">
          {icon ? (
            React.isValidElement(icon)
              ? React.cloneElement(icon as React.ReactElement<{ className?: string }>, {
                  className: 'w-4 h-4 text-current'
                })
              : icon
          ) : (
            <Fingerprint className="w-4 h-4 text-current" />
          )}
        </span>
        <span>{triggerLabel}</span>
      </button>

      {/* Confirmation Modal / Sheet Overlay */}
      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="family-receive-title"
          aria-describedby="family-receive-desc"
          className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={(e) => {
            if (e.target === e.currentTarget) handleClose();
          }}
        >
          <div
            ref={modalRef}
            className="w-full max-w-sm rounded-[32px] bg-[#E8ECEF] p-6 shadow-2xl border border-white/60 tactile-modal transform animate-in zoom-in-95 duration-200 relative overflow-hidden"
          >
            {/* Top Close Button */}
            <button
              type="button"
              onClick={handleClose}
              aria-label="Close"
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-[#E8ECEF] border border-[#D6DCE2] flex items-center justify-center text-[#7A6658] hover:text-[#1F140A] active:scale-90 transition-transform cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Central Illuminated Icon */}
            <div className="flex flex-col items-center text-center mt-2">
              <div className="relative w-20 h-20 rounded-full bg-linear-to-b from-orange-100 to-amber-50 border-2 border-[#FE7200]/40 flex items-center justify-center text-[#FE7200] shadow-[0_10px_25px_rgba(254,114,0,0.25)] mb-4">
                <div className="absolute inset-0 rounded-full animate-ping bg-[#FE7200]/15 pointer-events-none" />
                {icon ? icon : <Fingerprint size={36} className="text-[#FE7200]" />}
              </div>

              {/* Title & Description */}
              <h3
                id="family-receive-title"
                className="text-xl font-extrabold text-[#1F140A] tracking-tight"
              >
                {title}
              </h3>
              <p
                id="family-receive-desc"
                className="text-xs font-semibold text-[#7A6658] mt-2 leading-relaxed max-w-xs"
              >
                {description}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="mt-6 flex flex-col gap-2.5">
              <button
                ref={confirmBtnRef}
                type="button"
                onClick={handleConfirm}
                disabled={isProcessing}
                className="w-full h-12 rounded-xl bg-[#FE7200] hover:bg-[#E05D00] text-white font-extrabold text-sm flex items-center justify-center gap-2 btn-orange-shadow cursor-pointer transition-all active:scale-98 disabled:opacity-60"
              >
                {isProcessing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Processing…</span>
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" strokeWidth={2.8} />
                    <span>{confirmLabel}</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleClose}
                disabled={isProcessing}
                className="w-full h-10 rounded-xl bg-[#E8ECEF] border border-[#D6DCE2] text-[#7A6658] hover:text-[#1F140A] font-bold text-xs flex items-center justify-center transition-colors cursor-pointer active:scale-98"
              >
                {cancelLabel}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default FamilyReceiveComponent;
