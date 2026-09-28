import React from 'react';

interface LocationPermissionScreenProps {
  onAllow?: () => void;
  onManual?: () => void;
}

/**
 * Screen 09 — "Location Permission & Campus Geofence", 1:1 from
 * figma_svgs/09_location_permission.svg (375 × 812):
 *   - Feed silhouette: #DDE8E1 @.6 rects (20,50,335×120) and 2× (160×200) at y=190
 *   - Overlay ........ #032A15 @0.55
 *   - Dialog ......... (18,130) 339×590 rx=28 #E5EDE9, white stroke .85, soft shadow
 *   - Handle ......... 45×4 rx=2 #BAC8C0 at (147,14) inside dialog
 *   - Radar .......... center (169.5,115): r72 #DFEBE3 stroke #CAD8D0 1.5; r50 dashed
 *                      #BACFC2 "4 4"; r28 dashed #A6C2B0 "3 3"; sweep wedge 0°→90°
 *                      #09431B @.18; center dot r7 #09431B + halo r16 @.18 + white stroke 2.5;
 *                      Canteen pin (36,-30) r5 #F26A00 + halo r10 @.25; Chai Spot (-34,28)
 *                      r4 #09431B + halo r8 @.2; labels 8 w700
 *   - Title .......... "Enable Campus Radar" 19 w800 centered (y=224); two copy lines
 *                      11.5 w500 #5C7A6D (y=247/263)
 *   - Field 1 ........ (24,288) 291×56 rx=14 #EFF5EF stroke #C4D8CB; clock badge r17
 *                      #DDECE3; "Live Distance & Walk Time" 11.5 w800; sub 10 w600;
 *                      "⏱ 2 min" chip 48×22 rx=11 #DCEAE1 9 w700 #09431B at (230,16)
 *   - Field 2 ........ (24,354) same; runner badge r17 #FFEAD9 orange icon; "Fresh Batch
 *                      Arrival Alerts"; "Hot Samosas ready in 6m • Pot #2 Biryani";
 *                      "🔥 Hot" chip 46×22 rx=11 #FFE8D6 9 w700 #F26A00 at (232,16)
 *   - Privacy ........ y=435 centered 10 w600 #6A8679 "🔒 Geofenced strictly to campus bounds…"
 *   - Buttons ........ Allow (24,458) 291×46 rx=12 emerald gradient 14 w800;
 *                      Manual (24,514) 291×42 rx=12 #EFF5EF stroke #C8D8CE 12 w700
 */
export const LocationPermissionScreen: React.FC<LocationPermissionScreenProps> = ({
  onAllow,
  onManual
}) => {
  return (
    <div className="relative w-full max-w-[390px] mx-auto bg-[#E8ECEF] h-[812px] select-none overflow-hidden shadow-2xl rounded-[36px] border border-[#D6DCE2] font-sans">
      {/* Feed silhouette */}
      <div className="absolute left-[20px] top-[50px] w-[335px] h-[120px] rounded-[18px] bg-[#DDE8E1]/60" />
      <div className="absolute left-[20px] top-[190px] w-[160px] h-[200px] rounded-[18px] bg-[#DDE8E1]/60" />
      <div className="absolute left-[195px] top-[190px] w-[160px] h-[200px] rounded-[18px] bg-[#DDE8E1]/60" />

      {/* Dark overlay — #032A15 @ 0.55 */}
      <div className="absolute inset-0" style={{ background: 'rgba(3, 42, 21, 0.55)' }} />

      {/* Floating dialog — (18,130) 339×590 rx=28 */}
      <div
        className="absolute left-[18px] top-[130px] w-[339px] h-[590px] rounded-[28px] bg-[#E8ECEF] border border-white/60 overflow-hidden"
        style={{ boxShadow: '-6px -6px 12px rgba(255,255,255,0.85), 6px 6px 12px rgba(163,174,187,0.45)' }}
      >
        {/* Handle — (147,14) 45×4 */}
        <div className="absolute left-[147px] top-[14px] w-[45px] h-[4px] rounded-[2px] bg-[#BAC8C0]" />

        {/* Radar illustration — center (169.5,115) */}
        <div className="absolute left-[169.5px] top-[115px] -translate-x-1/2 -translate-y-1/2">
          <svg width="144" height="144" viewBox="-72 -72 144 144" aria-hidden>
            <circle cx="0" cy="0" r="72" fill="#DFEBE3" stroke="#D6DCE2" strokeWidth="1.5" />
            <circle cx="0" cy="0" r="50" fill="none" stroke="#C9D0D8" strokeWidth="1.5" strokeDasharray="4 4" />
            <circle cx="0" cy="0" r="28" fill="none" stroke="#A6C2B0" strokeWidth="1.5" strokeDasharray="3 3" />
            {/* Sweep wedge (top-right quadrant) */}
            <path d="M0 0 L51 -51 A72 72 0 0 1 72 0 Z" fill="#09431B" opacity="0.18" />
            {/* Center user marker */}
            <circle cx="0" cy="0" r="16" fill="#09431B" opacity="0.18" />
            <circle cx="0" cy="0" r="7" fill="#09431B" stroke="#FFFFFF" strokeWidth="2.5" />
            {/* Canteen pin at (36,-30) */}
            <g transform="translate(36 -30)">
              <circle cx="0" cy="0" r="10" fill="#F26A00" opacity="0.25" />
              <circle cx="0" cy="0" r="5" fill="#F26A00" stroke="#FFF" strokeWidth="1.5" />
              <text x="8" y="3" fontSize="8" fontWeight="700" fill="#0A2E20">Canteen</text>
            </g>
            {/* Chai Spot at (-34,28) */}
            <g transform="translate(-34 28)">
              <circle cx="0" cy="0" r="8" fill="#09431B" opacity="0.2" />
              <circle cx="0" cy="0" r="4" fill="#09431B" stroke="#FFF" strokeWidth="1.5" />
              <text x="7" y="3" fontSize="8" fontWeight="700" fill="#0A2E20">Chai Spot</text>
            </g>
          </svg>
        </div>

        {/* Title & copy — baselines y=224/247/263 */}
        <h2 className="absolute top-[208px] w-full text-center text-[19px] font-extrabold text-[#0A2E20]">
          Enable Campus Radar
        </h2>
        <p className="absolute top-[236px] w-full text-center text-[11.5px] font-medium leading-[16px] text-[#5C7A6D]">
          Calculate real-time walking distance to each tuck shop
          <br />
          and receive alerts when fresh batches come out.
        </p>

        {/* Field 1 — (24,288) 291×56 rx=14 */}
        <div
          className="absolute left-[24px] top-[288px] w-[291px] h-[56px] rounded-[14px] bg-[#E8ECEF] border border-[#D6DCE2]"
        >
          <div className="absolute left-[14px] top-[11px] w-[34px] h-[34px] rounded-full bg-[#D6DCE2] flex items-center justify-center">
            <svg width="20" height="20" viewBox="0 0 34 34" aria-hidden>
              <circle cx="17" cy="17" r="9" fill="none" stroke="#09431B" strokeWidth="1.8" />
              <path d="M17 12 V17 H20.5" stroke="#09431B" strokeWidth="1.8" strokeLinecap="round" fill="none" />
            </svg>
          </div>
          <p className="absolute left-[56px] top-[14px] text-[11.5px] font-extrabold text-[#0A2E20]">
            Live Distance &amp; Walk Time
          </p>
          <p className="absolute left-[56px] top-[32px] text-[10px] font-semibold text-[#5C7A6D]">
            Main Canteen: 2 min walk • Nescafe: 4 min
          </p>
          <div className="absolute left-[230px] top-[16px] w-[48px] h-[22px] rounded-[11px] bg-[#D6DCE2] flex items-center justify-center">
            <span className="text-[9px] font-bold text-[#09431B]">⏱ 2 min</span>
          </div>
        </div>

        {/* Field 2 — (24,354) 291×56 rx=14 */}
        <div
          className="absolute left-[24px] top-[354px] w-[291px] h-[56px] rounded-[14px] bg-[#E8ECEF] border border-[#D6DCE2]"
        >
          <div className="absolute left-[14px] top-[11px] w-[34px] h-[34px] rounded-full bg-[#FFEAD9] flex items-center justify-center">
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
          <p className="absolute left-[56px] top-[14px] text-[11.5px] font-extrabold text-[#0A2E20]">
            Fresh Batch Arrival Alerts
          </p>
          <p className="absolute left-[56px] top-[32px] text-[10px] font-semibold text-[#5C7A6D]">
            Hot Samosas ready in 6m • Pot #2 Biryani
          </p>
          <div className="absolute left-[232px] top-[16px] w-[46px] h-[22px] rounded-[11px] bg-[#FFE8D6] flex items-center justify-center">
            <span className="text-[9px] font-bold text-[#F26A00]">🔥 Hot</span>
          </div>
        </div>

        {/* Privacy line — y=435 */}
        <p className="absolute top-[424px] w-full text-center text-[10px] font-semibold text-[#6A8679]">
          🔒 Geofenced strictly to campus bounds. Battery friendly.
        </p>

        {/* Allow button — (24,458) 291×46 rx=12 */}
        <button
          type="button"
          onClick={onAllow}
          className="absolute left-[24px] top-[458px] w-[291px] h-[46px] rounded-[12px] text-white text-[14px] font-extrabold cursor-pointer hover:brightness-110 active:scale-[0.98] transition-all"
          style={{
            background: 'linear-gradient(180deg, #0A461E 0%, #063214 100%)',
            boxShadow: '-3px -3px 7px rgba(255,255,255,0.8), 4px 4px 8px rgba(163,174,187,0.4)'
          }}
        >
          Allow While Using App
        </button>

        {/* Manual button — (24,514) 291×42 rx=12 */}
        <button
          type="button"
          onClick={onManual}
          className="absolute left-[24px] top-[514px] w-[291px] h-[42px] rounded-[12px] bg-[#E8ECEF] border border-[#D6DCE2] text-[12px] font-bold text-[#0A2E20] cursor-pointer hover:bg-white active:scale-[0.98] transition-all"
        >
          Set Campus Manually
        </button>
      </div>
    </div>
  );
};
