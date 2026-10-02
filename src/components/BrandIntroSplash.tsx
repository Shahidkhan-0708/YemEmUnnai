import React, { useState, useEffect } from 'react';
import { playSuccessChime, playTapSound } from '../lib/celebration';

interface BrandIntroSplashProps {
  onStart: () => void;
  onSkip?: () => void;
  onVendorPortal?: () => void;
}

/**
 * Brand Intro Splash Screen — Zomato & Swiggy inspired minimalist brand splash.
 * Guided by Founder & Designer: Only the iconic steaming logo, perfectly centered,
 * pure brand presence, zero visual clutter.
 */
export const BrandIntroSplash: React.FC<BrandIntroSplashProps> = ({
  onStart,
}) => {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Smooth scale-in entrance
    const enterTimer = setTimeout(() => setIsLoaded(true), 60);

    // Auto-advance to food discovery after 2.4s (standard Swiggy / Zomato splash duration)
    const autoAdvanceTimer = setTimeout(() => {
      onStart();
    }, 2400);

    return () => {
      clearTimeout(enterTimer);
      clearTimeout(autoAdvanceTimer);
    };
  }, [onStart]);

  const handleEnter = () => {
    playSuccessChime();
    playTapSound();
    onStart();
  };

  return (
    <div
      onClick={handleEnter}
      onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); handleEnter(); } }}
      role="button"
      tabIndex={0}
      aria-label="Enter YEMUNNAI campus food discovery"
      className="relative w-full max-w-97.5 mx-auto min-h-203 h-full bg-linear-to-b from-[#02180A] via-[#042410] to-[#011207] select-none overflow-hidden shadow-2xl rounded-[36px] border border-[#164326] font-sans flex flex-col items-center justify-center cursor-pointer transition-all"
    >
      {/* Cinematic ambient background glow — deep atmospheric light */}
      <div className="absolute w-80 h-80 rounded-full bg-emerald-500/20 blur-[100px] pointer-events-none -translate-y-6" />
      <div className="absolute w-64 h-64 rounded-full bg-amber-500/10 blur-[80px] pointer-events-none translate-y-12" />

      {/* Rising Steam Effect above the steaming cup mascot */}
      <div className="relative w-24 h-12 flex items-center justify-center -mb-3 pointer-events-none z-10">
        <svg
          className="absolute left-6 bottom-0 w-6 h-10 text-white/70 animate-steam-1"
          viewBox="0 0 24 40"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M12 36C8 30 16 22 12 14C8 6 15 2 12 0"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
        </svg>
        <svg
          className="absolute right-6 bottom-1 w-6 h-10 text-amber-200/80 animate-steam-2"
          viewBox="0 0 24 40"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M10 38C14 32 6 24 11 16C16 8 8 3 11 0"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
          />
        </svg>
      </div>

      {/* Iconic Centered Brand Logo */}
      <div
        className={`relative z-10 flex flex-col items-center justify-center transition-all duration-700 ease-out ${
          isLoaded
            ? 'opacity-100 scale-100 translate-y-0 animate-mascot-float'
            : 'opacity-0 scale-90 translate-y-4'
        }`}
      >
        <div className="w-65 h-65 rounded-[36px] overflow-hidden p-2 flex items-center justify-center shadow-[0_20px_50px_rgba(0,0,0,0.7),0_0_40px_rgba(16,185,129,0.25)] border border-emerald-500/25 bg-[#052613]/80 backdrop-blur-md">
          <img
            src="/images/logo.png"
            alt="YEMUNNAI"
            className="w-full h-full object-contain drop-shadow-[0_12px_24px_rgba(0,0,0,0.6)]"
          />
        </div>
      </div>
    </div>
  );
};
