import React, { useEffect, useRef } from 'react';
import { playSuccessChime, playTapSound } from '../lib/celebration';

interface BrandIntroSplashProps {
  onStart: () => void;
  onSkip?: () => void;
  onVendorPortal?: () => void;
}

/**
 * Brand Intro Splash Screen — 9:16 pure mascot logo animation.
 * Plays the watermark-free YEMUNNAI logo animation seamlessly in 9:16 ratio,
 * auto-advancing into the app on completion with zero visual clutter.
 */
export const BrandIntroSplash: React.FC<BrandIntroSplashProps> = ({
  onStart,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.play().catch(() => {
        // Autoplay handled
      });
    }

    // Auto-advance fallback when video duration ends (5.5s)
    const autoAdvanceTimer = setTimeout(() => {
      onStart();
    }, 5600);

    return () => {
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
      role="button"
      tabIndex={0}
      aria-label="Enter YEMUNNAI"
      className="fixed inset-0 z-50 flex items-center justify-center bg-white select-none p-0 sm:p-4 cursor-pointer"
    >
      {/* 9:16 Aspect Ratio Viewport */}
      <div className="relative w-full max-w-[430px] aspect-[9/16] max-h-[100dvh] h-full sm:h-auto overflow-hidden bg-[#F06A05] sm:rounded-[36px] shadow-2xl flex items-center justify-center">
        <video
          ref={videoRef}
          src="/videos/yemunnai_intro_clean.mp4"
          autoPlay
          muted
          playsInline
          onEnded={handleEnter}
          className="w-full h-full object-cover"
        />
      </div>
    </div>
  );
};

export default BrandIntroSplash;
