import React, { useEffect, useState } from 'react';
import { Settings, Phone, MapPin, Check, X, ClipboardList, ThumbsUp, LogIn, LogOut, RefreshCw } from 'lucide-react';
import { useVendorSession, useVendorOrders, useVendorStats } from '../lib/hooks';
import { setOrderStatus, setVendorOnline } from '../lib/api';
import { isBackendConfigured } from '../lib/supabase';
import { VendorLoginModal } from './VendorLoginModal';

interface BusinessDashboardScreenProps {
  onAddNewItem?: () => void;
}

/**
 * Screen 04 — "Business Dashboard", 1:1 from
 * figma_svgs/04_business_dashboard.svg (375 × 812):
 *   - Header ......... emerald gradient to y≈210 (Q185 221 curve), shop photo 60px circle
 *                      at (23,34), name 21px w800, "Dashboard" 16px w500 #E0ECE4,
 *                      settings gear 23px @ (328,50), hairline y=116 #497658 @ .6
 *   - Live row ....... "Live" 15px w600 (baseline y=157) + toggle 43×24 rx=12 #73AF83,
 *                      knob d=18 at RIGHT (cx=96); ONLINE/OFFLINE segmented control
 *                      157×32 rx=16 #DCE5E0 at x=194, active pill 75×24 #09431B
 *   - Stat cards ..... 3 × 109×106 rx=18 at y=237, gap 8px: clipboard icon, thumbs-up icon,
 *                      gold star path (#EAA02B), label 11px w600 (y=301), value 18px w800 (y=323)
 *   - Orders panel ... x=16 y=368 w=343 h=242 rx=21, "INCOMING ORDERS" 14px w800 (y=398),
 *                      "Feed" 11px w500 right (x=342), divider y=412 #CCD9D1
 *   - Order row ...... photo 85×85 rx=12 at (30,427), name/price 16px w800 (y=445),
 *                      vendor 11px w500 (y=465), phone/address strips 220×26 rx=8 #DCE7E1
 *                      (y=473 / y=504, icons 24px @ .667, "Phone:"/"Deliver to:" 10px w700
 *                      #5C7A6D + value 11px w800 #0A2E20)
 *   - Buttons ........ Decline 150×42 rx=12 #FDF3F2 stroke #E5ABA5 (x=30, y=546), X 18px
 *                      #B4382B sw2.2, text 13px w700 #B4382B; Accept 150×42 #09431B (x=195),
 *                      check 18px sw2.2, text 13px w700 white
 *   - Footer ......... "New orders appear here in real time" 11px w500 centered (y=657)
 */
export const BusinessDashboardScreen: React.FC<BusinessDashboardScreenProps> = ({
  onAddNewItem
}) => {
  const { vendor, checking, signOut } = useVendorSession();
  const [isLoginOpen, setIsLoginOpen] = useState(false);

  // Auto-open login when a signed-out vendor visits the portal (live mode only)
  useEffect(() => {
    if (isBackendConfigured && !checking && !vendor) setIsLoginOpen(true);
  }, [checking, vendor]);

  // Screen Gallery (App) asks to show screen 12 — Access Login
  useEffect(() => {
    const open = () => setIsLoginOpen(true);
    window.addEventListener('open-vendor-login', open);
    return () => window.removeEventListener('open-vendor-login', open);
  }, []);

  const { orders, loading: ordersLoading } = useVendorOrders(vendor?.vendorId ?? null);
  const stats = useVendorStats(vendor?.vendorId ?? null);

  const [isOnline, setIsOnline] = useState(true);

  const handleAccept = async (id: string) => {
    await setOrderStatus(id, 'accepted');
  };

  const handleDecline = async (id: string) => {
    await setOrderStatus(id, 'declined');
  };

  const toggleOnline = async () => {
    if (!vendor) return;
    const next = !isOnline;
    setIsOnline(next); // optimistic
    await setVendorOnline(vendor.vendorId, next);
  };

  // ------------------------------------------------------------------ login gate
  if (isBackendConfigured && !vendor) {
    return (
      <div className="relative">
        <div className="w-full max-w-[390px] mx-auto bg-[#EBF2EE] min-h-[820px] pb-10 select-none relative shadow-2xl rounded-[36px] border border-[#D6DCE2] flex flex-col items-center justify-center gap-4 px-8 text-center">
          {checking ? (
            <>
              <RefreshCw className="w-8 h-8 text-[#09431B] animate-spin" />
              <p className="text-xs font-bold text-[#5C7A6D]">Checking your session…</p>
            </>
          ) : (
            <>
              <div className="w-16 h-16 rounded-3xl bg-[#09431B] flex items-center justify-center shadow-lg">
                <LogIn className="w-7 h-7 text-white" />
              </div>
              <h2 className="text-base font-black text-[#0A2E20]">Business Portal</h2>
              <p className="text-xs text-[#5C7A6D]">
                Sign in with your vendor account to see live orders, manage stock and track ratings.
              </p>
              <button
                onClick={() => setIsLoginOpen(true)}
                className="w-full py-3 bg-[#09431B] text-white rounded-full text-xs font-extrabold btn-green-shadow hover:bg-[#073515] active:scale-98 transition-all cursor-pointer"
              >
                Vendor Sign In
              </button>
            </>
          )}
        </div>

        <VendorLoginModal isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} />
      </div>
    );
  }

  // ------------------------------------------------------------------ dashboard
  return (
    <div className="relative">
      <div className="w-full max-w-[390px] mx-auto bg-[#EBF2EE] min-h-[820px] pb-10 select-none overflow-hidden relative shadow-2xl rounded-[36px] border border-[#D6DCE2]">
        {/* HEADER — emerald gradient, curve to y≈221 */}
        <div className="bg-gradient-to-b from-[#0A461E] to-[#063214] px-4 pt-8 pb-6 text-white relative overflow-hidden">
          <div
            className="absolute inset-x-0 bottom-0 h-4 bg-[#063214]"
            style={{ borderRadius: '50% 50% 0 0 / 100% 100% 0 0' }}
          />

          {/* Shop identity — photo 60px at (23,34), name 21px w800, sub 16px w500 */}
          <div className="flex items-center justify-between relative">
            <div className="flex items-center gap-[14px]">
              <div className="w-[60px] h-[60px] rounded-full overflow-hidden bg-[#E8ECEF] shrink-0">
                <img
                  src="/images/shop_canteen.jpg"
                  alt={vendor?.vendorName ?? 'Your shop'}
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <h2 className="text-[21px] font-extrabold text-white leading-[26px] truncate max-w-[210px]">
                  {vendor?.vendorName ?? 'MITS Canteen'}
                </h2>
                <p className="text-[16px] font-medium text-[#E0ECE4] leading-[20px]">Dashboard</p>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => void signOut()}
                title="Sign out"
                className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
              </button>
              <button
                className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-[#EDF5EF] hover:bg-white/20 transition-colors cursor-pointer"
                aria-label="Settings"
              >
                <Settings className="w-[23px] h-[23px]" strokeWidth={1.9} />
              </button>
            </div>
          </div>

          {/* Hairline — y=116, #497658 @ .6 */}
          <div className="mt-[10px] h-px bg-[#497658]/60 relative" />

          {/* Live row — "Live" + toggle 43×24; ONLINE/OFFLINE segmented 157×32 */}
          <div className="mt-[18px] flex items-center justify-between relative">
            <div className="flex items-center gap-[10px]">
              <span className="text-[15px] font-semibold text-white">Live</span>
              {/* Toggle: 43×24 rx=12 #73AF83, knob d=18 at RIGHT when live */}
              <button
                type="button"
                role="switch"
                aria-checked={isOnline}
                aria-label="Live feed"
                className="relative w-[43px] h-[24px] rounded-[12px] cursor-pointer transition-colors"
                style={{ background: isOnline ? '#73AF83' : '#AEB8C2' }}
              >
                <span
                  className="absolute top-[3px] w-[18px] h-[18px] rounded-full bg-[#F3F8F5] transition-all"
                  style={{
                    left: isOnline ? 22 : 3,
                    boxShadow: '-3px -3px 7px rgba(255,255,255,0.8), 4px 4px 8px rgba(163,174,187,0.4)'
                  }}
                />
              </button>
            </div>

            {/* ONLINE / OFFLINE segmented control — 157×32 rx=16 #DCE5E0, active pill 75×24 */}
            <div
              className="relative flex items-center w-[157px] h-[32px] rounded-[16px] bg-[#E8ECEF] border border-[#D6DCE2] p-[4px]"
              style={{ boxShadow: 'inset 3px 3px 6px rgba(154,166,179,0.5), inset -3px -3px 6px rgba(255,255,255,0.85)' }}
            >
              <span
                className="absolute top-[4px] w-[75px] h-[24px] rounded-[12px] bg-[#09431B] transition-all"
                style={{ left: isOnline ? 4 : 78 }}
              />
              <button
                onClick={() => isOnline || void toggleOnline()}
                className={`relative z-10 flex-1 text-[10px] font-extrabold tracking-wide cursor-pointer transition-colors ${
                  isOnline ? 'text-white' : 'text-[#0A2E20]'
                }`}
              >
                ONLINE
              </button>
              <button
                onClick={() => isOnline && void toggleOnline()}
                className={`relative z-10 flex-1 text-[10px] font-bold tracking-wide cursor-pointer transition-colors ${
                  !isOnline ? 'text-[#0A2E20] font-extrabold' : 'text-[#0A2E20]/70'
                }`}
              >
                OFFLINE
              </button>
            </div>
          </div>
        </div>

        {/* 3 STAT CARDS — 109×106 rx=18 at y=237 */}
        <div className="px-4 mt-4 grid grid-cols-3 gap-[8px]">
          {/* Orders Today — clipboard icon */}
          <div className="tactile-card rounded-[18px] pt-[13px] pb-[14px] flex flex-col items-center">
            <ClipboardList className="w-[24px] h-[24px] text-[#09431B]" strokeWidth={1.9} />
            <span className="mt-[24px] text-[11px] font-semibold text-[#0A2E20]">Orders Today</span>
            <span className="mt-[2px] text-[18px] font-extrabold text-[#0A2E20] tabular-nums">
              {stats.ordersToday}
            </span>
          </div>

          {/* Total Likes — thumbs-up icon */}
          <div className="tactile-card rounded-[18px] pt-[13px] pb-[14px] flex flex-col items-center">
            <ThumbsUp className="w-[24px] h-[24px] text-[#09431B]" strokeWidth={1.9} />
            <span className="mt-[24px] text-[11px] font-semibold text-[#0A2E20]">Total Likes</span>
            <span className="mt-[2px] text-[18px] font-extrabold text-[#0A2E20] tabular-nums">
              {stats.totalLikes}
            </span>
          </div>

          {/* Avg Rating — gold star */}
          <div className="tactile-card rounded-[18px] pt-[13px] pb-[14px] flex flex-col items-center">
            <svg width="26" height="26" viewBox="0 0 26 26" aria-hidden>
              <path
                d="M13 1.26 L15.51 6.66 L23.12 7.56 L17.19 11.85 L19.49 19.31 L13 15.48 L6.51 19.31 L8.81 11.85 L2.88 7.56 L10.49 6.66 Z"
                fill="#EAA02B"
              />
            </svg>
            <span className="mt-[23px] text-[11px] font-semibold text-[#0A2E20]">Avg Rating</span>
            <span className="mt-[2px] text-[18px] font-extrabold text-[#0A2E20] tabular-nums">
              {stats.avgRating != null ? stats.avgRating : '—'}
            </span>
          </div>
        </div>

        {/* INCOMING ORDERS PANEL — x=16 y=368 w=343 h=242 rx=21 */}
        <div className="mx-4 mt-[22px] tactile-card rounded-[21px] p-[14px]">
          <div className="flex items-baseline justify-between">
            <span className="text-[14px] font-extrabold tracking-wide text-[#0A2E20]">
              INCOMING ORDERS
            </span>
            <span className="text-[11px] font-medium text-[#5C7A6D]">
              Feed{!isBackendConfigured ? ' • demo' : ''}
            </span>
          </div>
          {/* Divider — y=412 */}
          <div className="mt-[7px] h-px bg-[#CCD9D1]" />

          {ordersLoading ? (
            <div className="py-10 text-center text-[11px] font-medium text-[#5C7A6D] animate-pulse">
              Loading live orders…
            </div>
          ) : orders.length === 0 ? (
            <p className="pt-[58px] pb-[54px] text-center text-[11px] font-medium text-[#5C7A6D]">
              New orders appear here in real time
            </p>
          ) : (
            <div className="mt-[15px] space-y-3">
              {orders.slice(0, 2).map((ord) => (
                <div key={ord.id}>
                  <div className="flex gap-[13px]">
                    {/* Photo 85×85 rx=12 */}
                    <div className="w-[85px] h-[85px] rounded-[12px] overflow-hidden bg-slate-100 shrink-0">
                      <img src={ord.image} alt={ord.item} className="w-full h-full object-cover" />
                    </div>

                    <div className="flex-1 min-w-0">
                      {/* Name / price — 16px w800, baseline y=445 */}
                      <div className="flex items-baseline justify-between">
                        <h4 className="text-[16px] font-extrabold text-[#0A2E20] truncate">
                          {ord.item}
                        </h4>
                        <span className="text-[16px] font-extrabold text-[#0A2E20] tabular-nums">
                          ₹{ord.price}
                        </span>
                      </div>
                      {/* Vendor — 11px w500, baseline y=465 */}
                      <p className="mt-[3px] text-[11px] font-medium text-[#5C7A6D] truncate">
                        {ord.vendor}
                      </p>

                      {/* Phone strip — 220×26 rx=8 #DCE7E1 */}
                      <div className="mt-[8px] h-[26px] rounded-[8px] bg-[#DDE2E8] flex items-center px-[7px] gap-[6px]">
                        <Phone className="w-[16px] h-[16px] text-[#09431B] shrink-0" strokeWidth={1.9} />
                        <span className="text-[10px] font-bold text-[#5C7A6D]">Phone:</span>
                        <span className="text-[11px] font-extrabold text-[#0A2E20] truncate">
                          {ord.phone}
                        </span>
                      </div>

                      {/* Address strip — 220×26 rx=8 #DCE7E1 */}
                      <div className="mt-[5px] h-[26px] rounded-[8px] bg-[#DDE2E8] flex items-center px-[7px] gap-[6px]">
                        <MapPin className="w-[16px] h-[16px] text-[#09431B] shrink-0" strokeWidth={1.9} />
                        <span className="text-[10px] font-bold text-[#5C7A6D]">Deliver to:</span>
                        <span className="text-[11px] font-extrabold text-[#0A2E20] truncate">
                          {ord.location}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Decline / Accept — 150×42 rx=12, 15px gap */}
                  <div className="mt-[21px] flex gap-[15px]">
                    {ord.status === 'accepted' ? (
                      <div className="w-full h-[42px] rounded-[12px] bg-[#E8ECEF] border border-[#D6DCE2] flex items-center justify-center gap-[7px]">
                        <Check className="w-[18px] h-[18px] text-[#09431B]" strokeWidth={2.2} />
                        <span className="text-[13px] font-bold text-[#09431B]">Accept &amp; Prep</span>
                      </div>
                    ) : (
                      <>
                        <button
                          onClick={() => void handleDecline(ord.id)}
                          aria-label={`Decline order for ${ord.item}`}
                          className="w-[150px] h-[42px] rounded-[12px] bg-[#FDF3F2] border border-[#E5ABA5] flex items-center justify-center gap-[8px] cursor-pointer hover:bg-[#FBE9E7] tactile-press transition-all shadow-xs"
                        >
                          <X className="w-[18px] h-[18px] text-[#B4382B]" strokeWidth={2.2} />
                          <span className="text-[13px] font-bold text-[#B4382B]">Decline</span>
                        </button>

                        <button
                          onClick={() => void handleAccept(ord.id)}
                          aria-label={`Accept order for ${ord.item}`}
                          className="w-[150px] h-[42px] rounded-[12px] bg-[#09431B] flex items-center justify-center gap-[8px] cursor-pointer hover:bg-[#073515] btn-green-shadow tactile-press transition-all"
                        >
                          <Check className="w-[18px] h-[18px] text-white" strokeWidth={2.2} />
                          <span className="text-[13px] font-bold text-white">Accept &amp; Prep</span>
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer note — baseline y=657 */}
        <p className="mt-[16px] text-center text-[11px] font-medium text-[#5C7A6D]">
          New orders appear here in real time
        </p>

        {/* Add New Item CTA (kept from live app; styled to the pack's 12px radius) */}
        <div className="px-4 mt-4">
          <button
            onClick={onAddNewItem}
            className="w-full h-[47px] rounded-[12px] bg-[#09431B] text-white text-[14px] font-bold cursor-pointer hover:bg-[#073515] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
            style={{ boxShadow: '-3px -3px 7px rgba(255,255,255,0.8), 4px 4px 8px rgba(163,174,187,0.4)' }}
          >
            <span>+ Add New Food Item</span>
          </button>
        </div>

        {/* Bottom iOS Home Indicator */}
        <div className="w-24 h-1 bg-[#09431B]/30 rounded-full mx-auto mt-6" />
      </div>

      <VendorLoginModal isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} />
    </div>
  );
};
