import React from 'react';

interface SplashOnboardingScreenProps {
  onExplore?: () => void;
  onBusinessPortal?: () => void;
}

/**
 * Screen 08 — "Splash & Campus Onboarding", 1:1 from
 * figma_svgs/08_splash_onboarding.svg (375 × 812):
 *   - Canvas ........ #E5EDE9; two decorative waves #DCE8E1 @.7 (y≈180) and
 *                     #D2E2D8 @.65 (y≈420)
 *   - Mascot card ... at (25,38) 325×255 rx=28 #EFF5EF stroke white .9 soft shadow;
 *                     rings r85 #E2EDE6 @.6 + r65 #D3E5DA @.8; mascot badge r58 #0A461E
 *                     (warm shadow) + r55 #E5EDE9 + image r52 at center (60,60)→(162.5,115);
 *                     "LIVE RADAR" pill 72×24 rx=12 #0A461E text 9.5 w800 #FF8A2A at (230,45);
 *                     "⚡ Real-time" pill 88×22 rx=11 white stroke #C4D8CB at (24,185)
 *   - Copy .......... at (25,310): badge 138×22 #D5E5DA "CAMPUS EATS LIVE" 9.5 w800 ls1;
 *                     "YEMEMUNNAI!" 26 w900 ls-.5 (y=52); tagline 13.5 w700 #0A461E (y=74);
 *                     sub 11 w500 #5C7A6D (y=94)
 *   - Location card . at (25,428) 325×72 rx=16 #EFF5EF stroke #C8DACE; pin circle r18 #09431B
 *                     with orange path; "Madanapalle Inst. of Tech & Science" 12 w800 (y=28);
 *                     sub 10 w600 (y=44); "Open Now ✓" chip 70×14 rx=7 #D9EADA 8.5 w700 (y=50)
 *   - Hours card .... at (25,510) 325×58; clock circle r16 #DDECE3; title 11.5 w800 (y=25);
 *                     "Mon – Sat: 8:00 AM – 9:30 PM • Hot snacks from 4 PM" 10 w600 (y=42)
 *   - Canteens card . at (25,578) 325×58; ⚡ circle r16 #FFEAD9; "3 Active Canteens Inside
 *                     Campus" 11.5 w800; "Main Canteen • Nescafe Corner • Chai Point" 10 w600
 *   - CTA ........... at (25,650) 325×48 rx=12 emerald gradient; "Explore Campus Food →" 14 w800
 *   - Merchant link . y=728 centered 11 w600 #5C7A6D, bold part #09431B w800
 */
export const SplashOnboardingScreen: React.FC<SplashOnboardingScreenProps> = ({
  onExplore,
  onBusinessPortal
}) => {
  return (
    <div className="relative w-full max-w-97.5 mx-auto bg-[#E8ECEF] h-203 select-none overflow-hidden shadow-2xl rounded-[36px] border border-[#D6DCE2] font-sans">
      {/* Decorative campus waves */}
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 375 812" aria-hidden>
        <path d="M-40 280 C60 180, 200 340, 420 220 L420 812 L-40 812 Z" fill="#DCE8E1" opacity="0.7" />
        <path d="M-30 460 C100 380, 240 510, 410 420 L410 812 L-30 812 Z" fill="#D2E2D8" opacity="0.65" />
      </svg>

      {/* Mascot badge card — (25,38) 325×255 rx=28 */}
      <div
        className="absolute left-6.25 top-9.5 w-81.25 h-63.75 rounded-[28px] bg-[#E8ECEF] border border-white/90 overflow-hidden"
        style={{ boxShadow: '-6px -6px 12px rgba(255,255,255,0.85), 6px 6px 12px rgba(163,174,187,0.45)' }}
      >
        {/* Inner rings */}
        <span className="absolute left-1/2 top-28.75 -translate-x-1/2 -translate-y-1/2 w-42.5 h-42.5 rounded-full bg-[#DDE2E8]/60" />
        <span className="absolute left-1/2 top-28.75 -translate-x-1/2 -translate-y-1/2 w-32.5 h-32.5 rounded-full bg-[#D3E5DA]/80" />

        {/* Mascot badge — center (162.5,115) */}
        <div
          className="absolute left-[102.5px] top-13.75 w-30 h-30 rounded-full bg-[#0A461E] flex items-center justify-center"
          style={{ boxShadow: '-3px -3px 7px rgba(255,255,255,0.8), 4px 4px 9px rgba(199,123,58,0.4)' }}
        >
          <div className="w-27.5 h-27.5 rounded-full bg-[#062814] overflow-hidden flex items-center justify-center p-1">
            <img
              src="/images/logo.png"
              alt="YEMUNNAI logo"
              className="w-full h-full object-contain"
            />
          </div>
        </div>

        {/* LIVE RADAR pill — (230,45) 72×24 */}
        <div
          className="absolute left-57.5 top-11.25 w-18 h-6 rounded-xl bg-[#0A461E] flex items-center justify-center"
          style={{ boxShadow: '-3px -3px 7px rgba(255,255,255,0.8), 4px 4px 8px rgba(163,174,187,0.4)' }}
        >
          <span className="text-[9.5px] font-extrabold text-[#FF8A2A] tracking-wide">LIVE RADAR</span>
        </div>

        {/* Real-time pill — (24,185) 88×22 */}
        <div className="absolute left-6 top-46.25 w-22 h-5.5 rounded-[11px] bg-white border border-[#D6DCE2] flex items-center justify-center">
          <span className="text-[9px] font-bold text-[#09431B]">⚡ Real-time</span>
        </div>
      </div>

      {/* Brand copy — at (25,310) */}
      <div className="absolute left-6.25 top-77.5">
        <div className="w-34.5 h-5.5 rounded-[11px] bg-[#D5E5DA] flex items-center justify-center">
          <span className="text-[9.5px] font-extrabold tracking-[1px] text-[#09431B]">CAMPUS EATS LIVE</span>
        </div>
        <h1 className="mt-3.5 text-[26px] font-black tracking-[-0.5px] text-[#0A2E20] leading-7.5">
          YEMEMUNNAI!
        </h1>
        <p className="mt-2 text-[13.5px] font-bold text-[#0A461E] leading-4.25">
          Never queue up for sold-out food.
        </p>
        <p className="mt-1.75 text-[11px] font-medium text-[#5C7A6D] leading-3.5">
          Discover fresh batches, live canteen menus, and walking times.
        </p>
      </div>

      {/* Location card — (25,428) 325×72 rx=16 */}
      <div
        className="absolute left-6.25 top-107 w-81.25 h-18 rounded-2xl bg-[#E8ECEF] border border-[#D6DCE2]"
        style={{ boxShadow: '-6px -6px 12px rgba(255,255,255,0.85), 6px 6px 12px rgba(163,174,187,0.45)' }}
      >
        {/* Pin circle at (39,444) r18 */}
        <div className="absolute left-3.5 top-4 w-9 h-9 rounded-full bg-[#09431B] flex items-center justify-center">
          <svg width="14" height="16" viewBox="0 0 12 15" aria-hidden>
            <path
              d="M6 0 C2.7 0 0 2.7 0 6 C0 10.5 6 15 6 15 C6 15 12 10.5 12 6 C12 2.7 9.3 0 6 0 Z M6 7.5 C4.9 7.5 4 6.6 4 5.5 C4 4.4 4.9 3.5 6 3.5 C7.1 3.5 8 4.4 8 5.5 C8 6.6 7.1 7.5 6 7.5 Z"
              fill="#FF8A2A"
            />
          </svg>
        </div>
        <p className="absolute left-15 top-5 text-[12px] font-extrabold text-[#0A2E20]">
          Madanapalle Inst. of Tech &amp; Science
        </p>
        <p className="absolute left-15 top-9.25 text-[10px] font-semibold text-[#5C7A6D]">
          Angallu, Campus Food Court • G-Floor
        </p>
        <div className="absolute left-15 top-12.5 w-17.5 h-3.5 rounded-[7px] bg-[#D6DCE2] flex items-center justify-center">
          <span className="text-[8.5px] font-bold text-[#0A461E]">Open Now ✓</span>
        </div>
      </div>

      {/* Hours card — (25,510) 325×58 rx=16 */}
      <div
        className="absolute left-6.25 top-127.5 w-81.25 h-14.5 rounded-2xl bg-[#E8ECEF] border border-[#D6DCE2]"
        style={{ boxShadow: '-6px -6px 12px rgba(255,255,255,0.85), 6px 6px 12px rgba(163,174,187,0.45)' }}
      >
        <div className="absolute left-3.5 top-3.25 w-8 h-8 rounded-full bg-[#D6DCE2] flex items-center justify-center">
          <svg width="20" height="20" viewBox="0 0 32 32" aria-hidden>
            <circle cx="16" cy="16" r="10" fill="none" stroke="#09431B" strokeWidth="1.8" />
            <path d="M16 11 V16 H19" stroke="#09431B" strokeWidth="1.8" strokeLinecap="round" fill="none" />
          </svg>
        </div>
        <p className="absolute left-14 top-4 text-[11.5px] font-extrabold text-[#0A2E20]">
          Operating Hours &amp; Live Kitchen
        </p>
        <p className="absolute left-14 top-8.5 text-[10px] font-semibold text-[#5C7A6D]">
          Mon – Sat: 8:00 AM – 9:30 PM • Hot snacks from 4 PM
        </p>
      </div>

      {/* Canteens card — (25,578) 325×58 rx=16 */}
      <div
        className="absolute left-6.25 top-144.5 w-81.25 h-14.5 rounded-2xl bg-[#E8ECEF] border border-[#D6DCE2]"
        style={{ boxShadow: '-6px -6px 12px rgba(255,255,255,0.85), 6px 6px 12px rgba(163,174,187,0.45)' }}
      >
        <div className="absolute left-3.5 top-3.25 w-8 h-8 rounded-full bg-[#FFEAD9] flex items-center justify-center">
          <span className="text-[13px]">⚡</span>
        </div>
        <p className="absolute left-14 top-4 text-[11.5px] font-extrabold text-[#0A2E20]">
          5 Active Canteens Inside Campus
        </p>
        <p className="absolute left-14 top-8.5 text-[10px] font-semibold text-[#5C7A6D]">
          MITS Canteen • MITS Cafe • Ekdant's • Lickies • New Cafe
        </p>
      </div>

      {/* CTA — (25,650) 325×48 rx=12 emerald gradient */}
      <button
        type="button"
        onClick={onExplore}
        className="absolute left-6.25 top-162.5 w-81.25 h-12 rounded-xl text-white text-[14px] font-extrabold cursor-pointer hover:brightness-110 active:scale-[0.98] transition-all"
        style={{
          background: 'linear-gradient(180deg, #0A461E 0%, #063214 100%)',
          boxShadow: '-3px -3px 7px rgba(255,255,255,0.8), 4px 4px 8px rgba(163,174,187,0.4)'
        }}
      >
        Explore Campus Food →
      </button>

      {/* Merchant link — y=728 */}
      <button
        type="button"
        onClick={onBusinessPortal}
        className="absolute top-179 w-full text-center text-[11px] font-semibold text-[#5C7A6D] cursor-pointer hover:opacity-80 transition-opacity"
      >
        Canteen owner? <span className="text-[#09431B] font-extrabold">Switch to Business Portal</span>
      </button>
    </div>
  );
};
