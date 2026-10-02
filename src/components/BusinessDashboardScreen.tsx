import React, { useEffect, useRef, useState } from 'react';
import { Phone, MapPin, Check, X, ClipboardList, ThumbsUp, LogIn, LogOut, RefreshCw, Fingerprint } from 'lucide-react';
import { FamilyReceiveComponent } from './FamilyReceiveComponent';
import { SaveToggle } from './SaveToggle';
import { RunActionButton } from './RunActionButton';
import Alert3 from './Alert3';
import Popover6 from './Popover6';
import { FaInbox } from 'react-icons/fa6';
import { RiBubbleChartFill } from 'react-icons/ri';
import { BsFileTextFill, BsSendFill, BsTagFill } from 'react-icons/bs';
import { TbClockHour12Filled } from 'react-icons/tb';
import { useVendorSession, useVendorOrders, useVendorStats } from '../lib/hooks';
import { setOrderStatus, setVendorOnline } from '../lib/api';
import { isBackendConfigured } from '../lib/supabase';
import { VendorLoginModal } from './VendorLoginModal';
import { playTapSound, playSuccessChime } from '../lib/celebration';

const settlementSteps = [
  { id: 1, label: 'Syncing Orders & Walk-ins', icon: FaInbox },
  { id: 2, label: 'Auditing Kitchen Stock', icon: RiBubbleChartFill },
  { id: 3, label: 'Reconciling UPI & Cash', icon: BsTagFill },
  { id: 4, label: 'Calculating Daily Margin', icon: TbClockHour12Filled },
  { id: 5, label: 'Compiling Daily Sales PDF', icon: BsFileTextFill },
  { id: 6, label: 'Submitting Accounts Report', icon: BsSendFill },
];

interface BusinessDashboardScreenProps {
  onAddNewItem?: () => void;
  onManageStock?: () => void;
}

/**
 * Screen 04 — "Business Dashboard", 1:1 from
 * figma_svgs/04_business_dashboard.svg (375 × 812):
 *   - Header ......... emerald gradient to y≈210 (Q185 221 curve), shop photo 60px circle
 *                      at (23,34), name 21px w800, "Dashboard" 16px w500 #E0ECE4,
 *                      settings gear 23px @ (328,50), hairline y=116 #497658 @ .6
 *   - Live row ....... "Live" 15px w600 (baseline y=157) + toggle 43×24 rx=12 #73AF83,
 *                      knob d=18 at RIGHT (cx=96); ONLINE/OFFLINE segmented control
 *                      157×32 rx=16 #DCE5E0 at x=194, active pill 75×24 #FE7200
 *   - Stat cards ..... 3 × 109×106 rx=18 at y=237, gap 8px: clipboard icon, thumbs-up icon,
 *                      gold star path (#EAA02B), label 11px w600 (y=301), value 18px w800 (y=323)
 *   - Orders panel ... x=16 y=368 w=343 h=242 rx=21, "INCOMING ORDERS" 14px w800 (y=398),
 *                      "Feed" 11px w500 right (x=342), divider y=412 #CCD9D1
 *   - Order row ...... photo 85×85 rx=12 at (30,427), name/price 16px w800 (y=445),
 *                      vendor 11px w500 (y=465), phone/address strips 220×26 rx=8 #DCE7E1
 *                      (y=473 / y=504, icons 24px @ .667, "Phone:"/"Deliver to:" 10px w700
 *                      #7A6658 + value 11px w800 #1F140A)
 *   - Buttons ........ Decline 150×42 rx=12 #FDF3F2 stroke #E5ABA5 (x=30, y=546), X 18px
 *                      #B4382B sw2.2, text 13px w700 #B4382B; Accept 150×42 #FE7200 (x=195),
 *                      check 18px sw2.2, text 13px w700 white
 *   - Footer ......... "New orders appear here in real time" 11px w500 centered (y=657)
 */
export const BusinessDashboardScreen: React.FC<BusinessDashboardScreenProps> = ({
  onAddNewItem,
  onManageStock
}) => {
  const { vendor, checking, signOut } = useVendorSession();
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busyAction, setBusyAction] = useState<string | null>(null);
  const actionLock = useRef(false);

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

  const { orders, loading: ordersLoading, error: ordersError } = useVendorOrders(vendor?.vendorId ?? null);
  const stats = useVendorStats(vendor?.vendorId ?? null);

  const [isOnline, setIsOnline] = useState(true);
  useEffect(() => { setIsOnline(vendor?.isOnline ?? false); setError(null); }, [vendor?.vendorId, vendor?.isOnline]);

  const save = async (key: string, action: () => Promise<void>) => {
    if (actionLock.current) return;
    actionLock.current = true;
    setBusyAction(key);
    setError(null);
    try { await action(); }
    catch (cause) { setError(cause instanceof Error ? cause.message : 'Could not save. Please try again.'); }
    finally { actionLock.current = false; setBusyAction(null); }
  };

  // Shop photo must match the signed-in shop (name ↔ image mirror mockData LOCAL_SHOPS)
  const SHOP_IMAGES: Record<string, string> = {
    'MITS Canteen': '/images/shop_mits_canteen.jpg',
    'MITS Cafe': '/images/shop_mits_cafe.jpg',
    "Ekdant's Cafe": '/images/shop_ekdants_cafe.jpg',
    Lickies: '/images/shop_lickies.jpg',
    'New Cafe': '/images/shop_new_cafe.jpg'
  };
  const shopImage = SHOP_IMAGES[vendor?.vendorName ?? ''] ?? '/images/shop_mits_canteen.jpg';

  const handleAccept = async (id: string) => {
    playTapSound();
    await save(id, () => setOrderStatus(id, 'accepted'));
  };

  const handleReady = async (id: string) => {
    await save(id, async () => { await setOrderStatus(id, 'completed'); playSuccessChime(); });
  };

  const handleDecline = async (id: string) => {
    playTapSound();
    await save(id, () => setOrderStatus(id, 'declined'));
  };

  const toggleOnline = async () => {
    if (!vendor) return;
    const next = !isOnline;
    await save('online', async () => {
      setIsOnline(next);
      try { await setVendorOnline(vendor.vendorId, next); }
      catch (cause) { setIsOnline(!next); throw cause; }
    });
  };

  // ------------------------------------------------------------------ login gate
  if (!isBackendConfigured || checking || !vendor) {
    return (
      <div className="relative">
        <div className="w-full bg-[#EBF2EE] min-h-screen pb-10 select-none relative flex flex-col items-center justify-center gap-4 px-8 text-center">
          {!isBackendConfigured ? (
            <><h2 className="text-base font-black text-[#1F140A]">Business Portal Unavailable</h2><p className="text-sm text-[#7A6658]">The server connection has not been configured.</p></>
          ) : checking ? (
            <>
              <RefreshCw className="w-8 h-8 text-[#FE7200] animate-spin" />
              <p className="text-xs font-bold text-[#7A6658]">Checking your session…</p>
            </>
          ) : (
            <>
              <div className="w-16 h-16 rounded-3xl bg-[#FE7200] flex items-center justify-center shadow-lg">
                <LogIn className="w-7 h-7 text-white" />
              </div>
              <h2 className="text-base font-black text-[#1F140A]">Business Portal</h2>
              <p className="text-xs text-[#7A6658]">
                Sign in with your cafe’s four-digit security PIN to manage its orders and menu.
              </p>
              <button
                onClick={() => setIsLoginOpen(true)}
                className="w-full py-3 bg-white text-[#FE7200] rounded-xl text-xs font-extrabold border border-[#D6DCE2] hover:bg-[#F3F8F5] active:scale-98 transition-all cursor-pointer"
              >
                Enter Cafe PIN
              </button>
            </>
          )}
        </div>

        <VendorLoginModal isOpen={isBackendConfigured && isLoginOpen} onClose={() => setIsLoginOpen(false)} />
      </div>
    );
  }

  // ------------------------------------------------------------------ dashboard
  return (
    <div className="relative">
      <div className="mx-auto w-full max-w-3xl bg-[#E8ECEF] min-h-dvh pb-10 relative">
        {/* HEADER — emerald gradient, curve to y≈221 */}
        <div className="bg-linear-to-b from-[#FE7200] to-[#E05D00] px-4 pt-8 pb-6 text-white relative overflow-hidden">
          <div
            className="absolute inset-x-0 bottom-0 h-4 bg-[#E05D00]"
            style={{ borderRadius: '50% 50% 0 0 / 100% 100% 0 0' }}
          />

          {/* Shop identity — photo 60px at (23,34), name 21px w800, sub 16px w500 */}
          <div className="flex items-center justify-between relative">
            <div className="flex min-w-0 items-center gap-3.5">
              <div className="w-15 h-15 rounded-full overflow-hidden bg-[#E8ECEF] shrink-0">
                <img
                  src={shopImage}
                  alt={vendor?.vendorName ?? 'Your shop'}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="min-w-0">
                <h2 className="text-[21px] font-extrabold text-white leading-6.5 truncate max-w-52.5">
                  {vendor?.vendorName ?? 'MITS Canteen'}
                </h2>
                <p className="text-[16px] font-medium text-[#E0ECE4] leading-5">Dashboard</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Popover6 />
              <SaveToggle
                size="sm"
                idleText="Save Shift"
                savedText="Saved"
                loadingDuration={1000}
                successDuration={1500}
                className="bg-white/20 text-white border-white/30 hover:bg-white/30"
              />
              <button
                onClick={() => void save('signout', signOut)}
                disabled={busyAction !== null}
                aria-label="Sign out"
                title="Sign out"
                className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Hairline — y=116, #497658 @ .6 */}
          <div className="mt-2.5 h-px bg-[#497658]/60 relative" />

          {/* Kitchen status row — Single ONLINE/OFFLINE segmented control */}
          <div className="mt-4.5 flex flex-wrap gap-3 items-center justify-between relative">
            <div className="flex items-center gap-2">
              <span className={`w-2.5 h-2.5 rounded-full ${isOnline ? 'bg-emerald-400 animate-pulse' : 'bg-slate-400'}`} />
              <span className="text-[13px] font-bold text-white tracking-wide">
                {isOnline ? 'Accepting Orders' : 'Canteen Closed'}
              </span>
            </div>

            {/* ONLINE / OFFLINE segmented control — 157×32 rx=16 #DCE5E0, active pill 75×24 */}
            <div
              className="relative flex items-center w-39.25 h-8 rounded-2xl bg-[#E8ECEF] border border-[#D6DCE2] p-1"
              style={{ boxShadow: 'inset 3px 3px 6px rgba(154,166,179,0.5), inset -3px -3px 6px rgba(255,255,255,0.85)' }}
            >
              <span
                className="absolute top-1 w-18.75 h-6 rounded-xl bg-[#FE7200] transition-all"
                style={{ left: isOnline ? 4 : 78 }}
              />
              <button
                type="button"
                onClick={() => isOnline || void toggleOnline()}
                disabled={busyAction !== null}
                aria-pressed={isOnline}
                className={`relative z-10 flex-1 text-[10px] font-extrabold tracking-wide cursor-pointer transition-colors ${
                  isOnline ? 'text-white' : 'text-[#1F140A]'
                }`}
              >
                ONLINE
              </button>
              <button
                type="button"
                onClick={() => isOnline && void toggleOnline()}
                disabled={busyAction !== null}
                aria-pressed={!isOnline}
                className={`relative z-10 flex-1 text-[10px] font-bold tracking-wide cursor-pointer transition-colors ${
                  !isOnline ? 'text-white font-extrabold' : 'text-[#1F140A]/70'
                }`}
              >
                OFFLINE
              </button>
            </div>
          </div>
        </div>

        {error && <p role="alert" className="mx-4 mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}
        {stats.error && <p role="alert" className="mx-4 mt-4 text-sm text-red-700">{stats.error}</p>}
        {/* 3 STAT CARDS — 109×106 rx=18 at y=237 */}
        <div className="px-4 mt-4 grid grid-cols-3 gap-2">
          {/* Orders Today — clipboard icon */}
          <div className="tactile-card rounded-[18px] pt-3.25 pb-3.5 flex flex-col items-center">
            <ClipboardList className="w-6 h-6 text-[#FE7200]" strokeWidth={1.9} />
            <span className="mt-6 text-[11px] font-semibold text-[#1F140A]">Orders Today</span>
            <span className="mt-0.5 text-[18px] font-extrabold text-[#1F140A] tabular-nums">
              {stats.error ? '—' : stats.ordersToday}
            </span>
          </div>

          {/* Total Likes — thumbs-up icon */}
          <div className="tactile-card rounded-[18px] pt-3.25 pb-3.5 flex flex-col items-center">
            <ThumbsUp className="w-6 h-6 text-[#FE7200]" strokeWidth={1.9} />
            <span className="mt-6 text-[11px] font-semibold text-[#1F140A]">Total Likes</span>
            <span className="mt-0.5 text-[18px] font-extrabold text-[#1F140A] tabular-nums">
              {stats.error ? '—' : stats.totalLikes}
            </span>
          </div>

          {/* Avg Rating — gold star */}
          <div className="tactile-card rounded-[18px] pt-3.25 pb-3.5 flex flex-col items-center">
            <svg width="26" height="26" viewBox="0 0 26 26" aria-hidden>
              <path
                d="M13 1.26 L15.51 6.66 L23.12 7.56 L17.19 11.85 L19.49 19.31 L13 15.48 L6.51 19.31 L8.81 11.85 L2.88 7.56 L10.49 6.66 Z"
                fill="#EAA02B"
              />
            </svg>
            <span className="mt-5.75 text-[11px] font-semibold text-[#1F140A]">Avg Rating</span>
            <span className="mt-0.5 text-[18px] font-extrabold text-[#1F140A] tabular-nums">
              {stats.avgRating != null ? Number(stats.avgRating).toFixed(1) : '—'}
            </span>
          </div>
        </div>

        {/* Vendor Messages & Notification Alert */}
        <div className="mx-4 mt-5">
          <Alert3 />
        </div>

        {/* INCOMING ORDERS PANEL — x=16 y=368 w=343 h=242 rx=21 */}
        <div className="mx-4 mt-4 tactile-card rounded-[21px] p-3.5">
          <div className="flex items-baseline justify-between">
            <div className="flex items-center gap-2">
              <span className="text-[14px] font-extrabold tracking-wide text-[#1F140A]">
                INCOMING ORDERS
              </span>
              {orders.length > 0 && (
                <span className="text-[10px] font-extrabold bg-[#FE7200] text-white px-2 py-0.2 rounded-full">
                  {orders.length}
                </span>
              )}
            </div>
            <span className="text-[11px] font-medium text-[#7A6658]">
              Feed{!isBackendConfigured ? ' • demo' : ''}
            </span>
          </div>
          {/* Divider — y=412 */}
          <div className="mt-1.75 h-px bg-[#CCD9D1]" />

          {ordersError ? (
            <p role="alert" className="py-6 text-sm text-red-700">{ordersError}</p>
          ) : ordersLoading ? (
            <div className="py-10 text-center text-[11px] font-medium text-[#7A6658] animate-pulse">
              Loading live orders…
            </div>
          ) : orders.length === 0 ? (
            <p className="pt-14.5 pb-13.5 text-center text-[11px] font-medium text-[#7A6658]">
              New orders appear here in real time
            </p>
          ) : (
            <div className="mt-3.75 space-y-4 max-h-90 overflow-y-auto no-scrollbar pr-0.5">
              {orders.map((ord) => (
                <div key={ord.id} className="pb-3 border-b border-[#D6DCE2]/60 last:border-b-0 last:pb-0">
                  <div className="flex gap-3.25">
                    {/* Photo 85×85 rx=12 */}
                    <div className="w-21.25 h-21.25 rounded-xl overflow-hidden bg-slate-100 shrink-0">
                      <img src={ord.image} alt={ord.item} className="w-full h-full object-cover" />
                    </div>

                    <div className="flex-1 min-w-0">
                      {/* Name / price — 16px w800, baseline y=445 */}
                      <div className="flex items-baseline justify-between">
                        <h4 className="text-[16px] font-extrabold text-[#1F140A] truncate">
                          {ord.item}
                        </h4>
                        <span className="text-[16px] font-extrabold text-[#1F140A] tabular-nums">
                          ₹{ord.price}
                        </span>
                      </div>
                      {/* Vendor — 11px w500, baseline y=465 */}
                      <p className="mt-0.75 text-[11px] font-medium text-[#7A6658] truncate">
                        {ord.vendor}
                      </p>

                      {/* Phone strip — 220×26 rx=8 #DCE7E1 */}
                      <div className="mt-2 h-6.5 rounded-lg bg-[#DDE2E8] flex items-center px-1.75 gap-1.5">
                        <Phone className="w-4 h-4 text-[#FE7200] shrink-0" strokeWidth={1.9} />
                        <span className="text-[10px] font-bold text-[#7A6658]">Phone:</span>
                        <span className="text-[11px] font-extrabold text-[#1F140A] truncate">
                          {ord.phone}
                        </span>
                      </div>

                      {/* Address strip — 220×26 rx=8 #DCE7E1 */}
                      <div className="mt-1.25 h-6.5 rounded-lg bg-[#DDE2E8] flex items-center px-1.75 gap-1.5">
                        <MapPin className="w-4 h-4 text-[#FE7200] shrink-0" strokeWidth={1.9} />
                        <span className="text-[10px] font-bold text-[#7A6658]">Deliver to:</span>
                        <span className="text-[11px] font-extrabold text-[#1F140A] truncate">
                          {ord.location}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Decline / Accept / Ready actions */}
                  <div className="mt-4 flex gap-3">
                    {ord.status === 'accepted' ? (
                      <div className="w-full flex gap-2">
                        <div className="flex-1 h-10.5 rounded-xl bg-[#E4ECE7] border border-[#D6DCE2] flex items-center justify-center gap-1.5 text-[#FE7200] text-[12px] font-bold">
                          <Check className="w-4 h-4 text-[#FE7200]" strokeWidth={2.5} />
                          <span>Prepping</span>
                        </div>
                        <FamilyReceiveComponent
                          triggerLabel="Handover & Receive"
                          title="Confirm Order Handover"
                          description={`Confirm you have handed over ${ord.item} (Order #${ord.id.slice(-4)}) to customer (${ord.location}) and received payment of ₹${ord.price}.`}
                          confirmLabel="Receive & Complete"
                          cancelLabel="Cancel"
                          icon={<Fingerprint size={28} className="text-[#FE7200]" />}
                          disabled={busyAction !== null}
                          onConfirm={() => void handleReady(ord.id)}
                          className="flex-[1.4] h-10.5 text-[12px] font-bold"
                        />
                      </div>
                    ) : (
                      <>
                        <button
                          onClick={() => void handleDecline(ord.id)}
                          disabled={busyAction !== null}
                          aria-label={`Decline order for ${ord.item}`}
                          className="flex-1 min-w-0 min-h-11 rounded-xl bg-[#FDF3F2] border border-[#E5ABA5] flex items-center justify-center gap-2 cursor-pointer hover:bg-[#FBE9E7] tactile-press transition-all shadow-xs disabled:opacity-50"
                        >
                          <X className="w-4.5 h-4.5 text-[#B4382B]" strokeWidth={2.2} />
                          <span className="text-[13px] font-bold text-[#B4382B]">Decline</span>
                        </button>

                        <button
                          onClick={() => void handleAccept(ord.id)}
                          disabled={busyAction !== null}
                          aria-label={`Accept order for ${ord.item}`}
                          className="flex-1 min-w-0 min-h-11 rounded-xl bg-[#FE7200] flex items-center justify-center gap-2 cursor-pointer hover:bg-[#E05D00] btn-orange-shadow tactile-press transition-all disabled:opacity-50"
                        >
                          <Check className="w-4.5 h-4.5 text-white" strokeWidth={2.2} />
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

        {/* Actions: Add New Item & Manage Live Stock */}
        <div className="px-4 mt-5 grid grid-cols-2 gap-2.5">
          <button
            onClick={onAddNewItem}
            className="w-full h-11.75 rounded-xl bg-[#FE7200] text-white text-[12.5px] font-extrabold cursor-pointer hover:bg-[#E05D00] active:scale-[0.98] transition-all flex items-center justify-center gap-1.5"
            style={{ boxShadow: '-3px -3px 7px rgba(255,255,255,0.8), 4px 4px 8px rgba(163,174,187,0.4)' }}
          >
            <span>+ Add Item</span>
          </button>

          {onManageStock && (
            <button
              onClick={onManageStock}
              className="w-full h-11.75 rounded-xl bg-[#E8ECEF] border border-[#D6DCE2] text-[#FE7200] text-[12.5px] font-extrabold cursor-pointer hover:bg-white active:scale-[0.98] transition-all flex items-center justify-center gap-1.5"
              style={{ boxShadow: '-3px -3px 7px rgba(255,255,255,0.8), 4px 4px 8px rgba(163,174,187,0.4)' }}
            >
              <span>📋 Stock Console</span>
            </button>
          )}
        </div>

        {/* Daily Kitchen Pipeline & Settlement with RunActionButton */}
        <div className="mx-4 mt-5 p-4 rounded-2xl bg-white/80 border border-[#D6DCE2] backdrop-blur-xs flex flex-col items-center gap-2.5 shadow-sm">
          <div className="w-full flex items-center justify-between">
            <span className="text-[12px] font-black tracking-wide text-[#1F140A] uppercase">Daily Closeout Pipeline</span>
            <span className="text-[10px] font-bold text-[#FE7200] bg-[#FE7200]/10 px-2 py-0.5 rounded-full border border-[#FE7200]/20">Automated Audit</span>
          </div>
          <p className="text-[11px] text-[#7A6658] text-left w-full">
            Synchronize physical counters, reconcile UPI payments, audit inventory consumption, and dispatch end-of-day kitchen statements.
          </p>
          <div className="w-full flex justify-center pt-1">
            <RunActionButton steps={settlementSteps} />
          </div>
        </div>
      </div>

      <VendorLoginModal isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} />
    </div>
  );
};
