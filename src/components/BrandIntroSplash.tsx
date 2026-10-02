import React, { useState, useEffect, useRef } from 'react';
import { playSuccessChime, playTapSound } from '../lib/celebration';

interface BrandIntroSplashProps {
  onStart: () => void;
  onSkip?: () => void;
  onVendorPortal?: () => void;
}

/**
 * Brand Intro Splash Screen — Zomato & Swiggy inspired minimalist brand splash.
 * Featuring the custom YEMUNNAI mascot logo animation.
 */
export const BrandIntroSplash: React.FC<BrandIntroSplashProps> = ({
  onStart,
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    // Smooth scale-in entrance
    const enterTimer = setTimeout(() => setIsLoaded(true), 60);

    if (videoRef.current) {
      videoRef.current.play().catch(() => {});
    }

    // Auto-advance fallback after video finishes (~5.6s)
    const autoAdvanceTimer = setTimeout(() => {
      onStart();
    }, 5600);

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
      className="relative w-full max-w-97.5 mx-auto min-h-203 h-full bg-linear-to-b from-[#1A0C02] via-[#2A1405] to-[#120701] select-none overflow-hidden shadow-2xl rounded-[36px] border border-[#4A260B] font-sans flex flex-col items-center justify-center cursor-pointer transition-all"
    >
      {/* Cinematic ambient background glow — deep atmospheric light */}
      <div className="absolute w-80 h-80 rounded-full bg-[#FE7200]/25 blur-[100px] pointer-events-none -translate-y-6" />
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

      {/* Iconic Centered Brand Logo Animation */}
      <div
        className={`relative z-10 flex flex-col items-center justify-center transition-all duration-700 ease-out ${
          isLoaded
            ? 'opacity-100 scale-100 translate-y-0 animate-mascot-float'
            : 'opacity-0 scale-90 translate-y-4'
        }`}
      >
        <div className="w-68 h-68 sm:w-72 sm:h-72 rounded-[36px] overflow-hidden p-1 flex items-center justify-center shadow-[0_25px_60px_rgba(0,0,0,0.8),0_0_40px_rgba(254,114,0,0.35)] border-2 border-[#FE7200]/30 bg-[#F06A05] relative">
          <video
            ref={videoRef}
            src="/videos/yemunnai_intro_clean.mp4"
            autoPlay
            muted
            playsInline
            onEnded={handleEnter}
            poster="/images/NewLogo.svg"
            className="w-full h-full object-cover object-center rounded-[30px]"
          />
        </div>

        {/* Subtle tap-to-skip prompt */}
        <span className="text-[10px] font-bold text-white/50 hover:text-white/80 transition-colors mt-4 tracking-wider uppercase">
          Tap anywhere to skip →
        </span>
      </div>
    </div>
  );
};
