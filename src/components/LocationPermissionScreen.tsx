import React from 'react';

interface LocationPermissionScreenProps {
  onAllow?: () => void;
  onManual?: () => void;
}

/**
 * Screen 09 — "Location Permission & Campus Geofence", 1:1 from
 * figma_svgs/09_location_permission.svg (375 × 812):
 *   - Feed silhouette: #E8ECEF @.6 rects (20,50,335×120) and 2× (160×200) at y=190
 *   - Overlay ........ #241204 @0.55
 *   - Dialog ......... (18,130) 339×590 rx=28 #E8ECEF, white stroke .85, soft shadow
 *   - Handle ......... 45×4 rx=2 #D6DCE2 at (147,14) inside dialog
 *   - Radar .......... center (169.5,115): r72 #DFEBE3 stroke #D6DCE2 1.5; r50 dashed
 *                      #BACFC2 "4 4"; r28 dashed #A6C2B0 "3 3"; sweep wedge 0°→90°
 *                      #FE7200 @.18; center dot r7 #FE7200 + halo r16 @.18 + white stroke 2.5;
 *                      Canteen pin (36,-30) r5 #F26A00 + halo r10 @.25; Chai Spot (-34,28)
 *                      r4 #FE7200 + halo r8 @.2; labels 8 w700
 *   - Title .......... "Enable Campus Radar" 19 w800 centered (y=224); two copy lines
 *                      11.5 w500 #7A6658 (y=247/263)
 *   - Field 1 ........ (24,288) 291×56 rx=14 #E8ECEF stroke #C4D8CB; clock badge r17
 *                      #DDECE3; "Live Distance & Walk Time" 11.5 w800; sub 10 w600;
 *                      "⏱ 2 min" chip 48×22 rx=11 #DCEAE1 9 w700 #FE7200 at (230,16)
 *   - Field 2 ........ (24,354) same; runner badge r17 #FFEAD9 orange icon; "Fresh Batch
 *                      Arrival Alerts"; "Hot Samosas ready in 6m • Pot #2 Biryani";
 *                      "🔥 Hot" chip 46×22 rx=11 #FFE8D6 9 w700 #F26A00 at (232,16)
 *   - Privacy ........ y=435 centered 10 w600 #6A8679 "🔒 Geofenced strictly to campus bounds…"
 *   - Buttons ........ Allow (24,458) 291×46 rx=12 emerald gradient 14 w800;
 *                      Manual (24,514) 291×42 rx=12 #E8ECEF stroke #D6DCE2 12 w700
 */
export const LocationPermissionScreen: React.FC<LocationPermissionScreenProps> = ({
  onAllow,
  onManual
}) => {
  return (
    <div className="relative w-full max-w-97.5 mx-auto bg-[#E8ECEF] h-203 select-none overflow-hidden shadow-2xl rounded-[36px] border border-[#D6DCE2] font-sans">
      {/* Feed silhouette */}
      <div className="absolute left-5 top-12.5 w-83.75 h-30 rounded-[18px] bg-[#E8ECEF]/60" />
      <div className="absolute left-5 top-47.5 w-40 h-50 rounded-[18px] bg-[#E8ECEF]/60" />
      <div className="absolute left-48.75 top-47.5 w-40 h-50 rounded-[18px] bg-[#E8ECEF]/60" />

      {/* Dark overlay — #241204 @ 0.55 */}
      <div className="absolute inset-0" style={{ background: 'rgba(3, 42, 21, 0.55)' }} />

      {/* Floating dialog — (18,130) 339×590 rx=28 */}
      <div
        className="absolute left-4.5 top-32.5 w-84.75 h-147.5 rounded-[28px] bg-[#E8ECEF] border border-white/60 overflow-hidden"
        style={{ boxShadow: '-6px -6px 12px rgba(255,255,255,0.85), 6px 6px 12px rgba(163,174,187,0.45)' }}
      >
        {/* Handle — (147,14) 45×4 */}
        <div className="absolute left-36.75 top-3.5 w-11.25 h-1 rounded-xs bg-[#D6DCE2]" />

        {/* Radar illustration — center (169.5,115) */}
        <div className="absolute left-[169.5px] top-28.75 -translate-x-1/2 -translate-y-1/2">
          <svg width="144" height="144" viewBox="-72 -72 144 144" aria-hidden>
            <circle cx="0" cy="0" r="72" fill="#DFEBE3" stroke="#D6DCE2" strokeWidth="1.5" />
            <circle cx="0" cy="0" r="50" fill="none" stroke="#C9D0D8" strokeWidth="1.5" strokeDasharray="4 4" />
            <circle cx="0" cy="0" r="28" fill="none" stroke="#A6C2B0" strokeWidth="1.5" strokeDasharray="3 3" />
            {/* Sweep wedge (top-right quadrant) */}
            <path d="M0 0 L51 -51 A72 72 0 0 1 72 0 Z" fill="#FE7200" opacity="0.18" />
            {/* Center user marker */}
            <circle cx="0" cy="0" r="16" fill="#FE7200" opacity="0.18" />
            <circle cx="0" cy="0" r="7" fill="#FE7200" stroke="#FFFFFF" strokeWidth="2.5" />
            {/* Canteen pin at (36,-30) */}
            <g transform="translate(36 -30)">
              <circle cx="0" cy="0" r="10" fill="#F26A00" opacity="0.25" />
              <circle cx="0" cy="0" r="5" fill="#F26A00" stroke="#FFF" strokeWidth="1.5" />
              <text x="8" y="3" fontSize="8" fontWeight="700" fill="#1F140A">Canteen</text>
            </g>
            {/* MITS Cafe at (-34,28) */}
            <g transform="translate(-34 28)">
              <circle cx="0" cy="0" r="8" fill="#FE7200" opacity="0.2" />
              <circle cx="0" cy="0" r="4" fill="#FE7200" stroke="#FFF" strokeWidth="1.5" />
              <text x="7" y="3" fontSize="8" fontWeight="700" fill="#1F140A">MITS Cafe</text>
            </g>
          </svg>
        </div>

        {/* Title & copy — baselines y=224/247/263 */}
        <h2 className="absolute top-52 w-full text-center text-[19px] font-extrabold text-[#1F140A]">
          Enable Campus Radar
        </h2>
        <p className="absolute top-59 w-full text-center text-[11.5px] font-medium leading-4 text-[#7A6658]">
          Calculate real-time walking distance to each tuck shop
          <br />
          and receive alerts when fresh batches come out.
        </p>

        {/* Field 1 — (24,288) 291×56 rx=14 */}
        <div
          className="absolute left-6 top-72 w-72.75 h-14 rounded-[14px] bg-[#E8ECEF] border border-[#D6DCE2]"
        >
          <div className="absolute left-3.5 top-2.75 w-8.5 h-8.5 rounded-full bg-[#D6DCE2] flex items-center justify-center">
            <svg width="20" height="20" viewBox="0 0 34 34" aria-hidden>
              <circle cx="17" cy="17" r="9" fill="none" stroke="#FE7200" strokeWidth="1.8" />
              <path d="M17 12 V17 H20.5" stroke="#FE7200" strokeWidth="1.8" strokeLinecap="round" fill="none" />
            </svg>
          </div>
          <p className="absolute left-14 top-3.5 text-[11.5px] font-extrabold text-[#1F140A]">
            Live Distance &amp; Walk Time
          </p>
          <p className="absolute left-14 top-8 text-[10px] font-semibold text-[#7A6658]">
            Main Canteen: 2 min walk • MITS Cafe: 4 min
          </p>
          <div className="absolute left-57.5 top-4 w-12 h-5.5 rounded-[11px] bg-[#D6DCE2] flex items-center justify-center">
            <span className="text-[9px] font-bold text-[#FE7200]">⏱ 2 min</span>
          </div>
        </div>

        {/* Field 2 — (24,354) 291×56 rx=14 */}
        <div
          className="absolute left-6 top-88.5 w-72.75 h-14 rounded-[14px] bg-[#E8ECEF] border border-[#D6DCE2]"
        >
          <div className="absolute left-3.5 top-2.75 w-8.5 h-8.5 rounded-full bg-[#FFEAD9] flex items-center justify-center">
            {/* Runner icon, 24px box scaled 1.7/24 */}
            <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden>
              <path
                d="M14 12 C15.1 12 16 11.1 16 10 C16 8.9 15.1 8 14 8 C12.9 8 12 8.9 12 10 C12 11.1 12.9 12 14 12 Z M18 13.5 L15 14.5 L13 18 L10.5 16.5 M15 14.5 L16.5 21 M11 20 L13 18"
                fill="none"
                stroke="#F26A00"
                strokeWidth="1.7"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <p className="absolute left-14 top-3.5 text-[11.5px] font-extrabold text-[#1F140A]">
            Fresh Batch Arrival Alerts
          </p>
          <p className="absolute left-14 top-8 text-[10px] font-semibold text-[#7A6658]">
            Hot Samosas ready in 6m • Fresh Filter Coffee
          </p>
          <div className="absolute left-58 top-4 w-11.5 h-5.5 rounded-[11px] bg-[#FFE8D6] flex items-center justify-center">
            <span className="text-[9px] font-bold text-[#F26A00]">🔥 Hot</span>
          </div>
        </div>

        {/* Privacy line — y=435 */}
        <p className="absolute top-106 w-full text-center text-[10px] font-semibold text-[#6A8679]">
          🔒 Geofenced strictly to campus bounds. Battery friendly.
        </p>

        {/* Allow button — (24,458) 291×46 rx=12 */}
        <button
          type="button"
          onClick={onAllow}
          className="absolute left-6 top-114.5 w-72.75 h-11.5 rounded-xl text-white text-[14px] font-extrabold cursor-pointer hover:brightness-110 active:scale-[0.98] transition-all"
          style={{
            background: 'linear-gradient(180deg, #FE7200 0%, #E05D00 100%)',
            boxShadow: '-3px -3px 7px rgba(255,255,255,0.8), 4px 4px 8px rgba(163,174,187,0.4)'
          }}
        >
          Allow While Using App
        </button>

        {/* Manual button — (24,514) 291×42 rx=12 */}
        <button
          type="button"
          onClick={onManual}
          className="absolute left-6 top-128.5 w-72.75 h-10.5 rounded-xl bg-[#E8ECEF] border border-[#D6DCE2] text-[12px] font-bold text-[#1F140A] cursor-pointer hover:bg-white active:scale-[0.98] transition-all"
        >
          Set Campus Manually
        </button>
      </div>
    </div>
  );
};
