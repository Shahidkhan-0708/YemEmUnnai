import { useState, useEffect, lazy, Suspense } from 'react';
import { HomeDiscoveryScreen } from './components/HomeDiscoveryScreen';
import type { FoodItem } from './lib/types';
import { QuickOrderModal } from './components/QuickOrderModal';
import { BrandIntroSplash } from './components/BrandIntroSplash';
import { InstallPrompt } from './components/InstallPrompt';
import { MobileDeviceShell, type ActiveOrderInfo } from './components/MobileDeviceShell';
import { playTapSound, playSuccessChime, fireOrderConfetti } from './lib/celebration';
import { subscribeOrderStatus } from './lib/api';
import { useVendorSession } from './lib/hooks';
import { safeStorage } from './lib/storage';
import { Sparkles, Download, ExternalLink, Eye } from 'lucide-react';

// Lazy-loaded modal & non-critical routes for fast initial bundle & 300+ user scalability
const FeedbackModal = lazy(() => import('./components/FeedbackModal').then(m => ({ default: m.FeedbackModal })));
const WalkInMapModal = lazy(() => import('./components/WalkInMapModal').then(m => ({ default: m.WalkInMapModal })));
const BusinessDashboardScreen = lazy(() => import('./components/BusinessDashboardScreen').then(m => ({ default: m.BusinessDashboardScreen })));
const AddEditFoodItemScreen = lazy(() => import('./components/AddEditFoodItemScreen').then(m => ({ default: m.AddEditFoodItemScreen })));
const LocationPermissionScreen = lazy(() => import('./components/LocationPermissionScreen').then(m => ({ default: m.LocationPermissionScreen })));
const FoodItemDetailScreen = lazy(() => import('./components/FoodItemDetailScreen').then(m => ({ default: m.FoodItemDetailScreen })));
const MenuStockManagementScreen = lazy(() => import('./components/MenuStockManagementScreen').then(m => ({ default: m.MenuStockManagementScreen })));
const ErrorPage = lazy(() => import('./components/ErrorPage'));

function ScreenFallback() {
  return (
    <div className="w-full min-h-115 flex flex-col items-center justify-center gap-3 bg-[#0F1A15] text-[#7A6658]">
      <div className="w-8 h-8 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin" />
      <span className="text-xs font-bold text-emerald-400/90 tracking-wide">Loading Screen...</span>
    </div>
  );
}

/** Stand-in item used by the Screen Gallery to open modals/screens without the grid.
 *  Mirrors the real MITS Canteen Samosa (see src/lib/mockData.ts) so demo
 *  screens never show a name/price/photo that contradicts the live menu. */
const DEFAULT_ORDER_ITEM: FoodItem = {
  id: 'gallery-demo',
  vendorId: 'a0000000-0000-4000-8000-000000000001',
  name: 'Samosa',
  vendor: 'MITS Canteen',
  price: 15,
  category: 'cooked',
  image: '/images/item_samosa_chicken.jpg',
  likes: 88,
  dislikes: 2,
  reviews: 34,
  rating: 4.8,
  walkTime: '2 min walk',
  actionType: 'order',
  inStock: true,
  isShopOnline: true
};

export function App() {
  const { vendor } = useVendorSession();
  const [activePortal, setActivePortal] = useState<'consumer' | 'business' | 'artifacts' | 'gallery' | '404'>(() => {
    if (typeof window !== 'undefined') {
      const p = new URLSearchParams(window.location.search).get('portal');
      if (p === 'business' || p === 'gallery' || p === 'artifacts' || p === '404') return p;
    }
    return 'consumer';
  });

  // Consumer flow opens straight into discovery; the location radar stays reachable from the home screen.
  const [consumerFlow, setConsumerFlow] = useState<'location' | 'discovery'>(() => {
    if (typeof window !== 'undefined') {
      const f = new URLSearchParams(window.location.search).get('flow');
      if (f === 'location') return 'location';
    }
    return 'discovery';
  });

  // Modals state
  const [selectedOrderFood, setSelectedOrderFood] = useState<FoodItem | null>(null);
  const [selectedOrderQty, setSelectedOrderQty] = useState(1);
  const [selectedWalkInFood, setSelectedWalkInFood] = useState<FoodItem | null>(null);
  const [selectedReviewFood, setSelectedReviewFood] = useState<FoodItem | null>(null);
  const [selectedDetailFood, setSelectedDetailFood] = useState<FoodItem | null>(null);
  const [isAddEditOpen, setIsAddEditOpen] = useState(() => {
    if (typeof window !== 'undefined') {
      return new URLSearchParams(window.location.search).get('add') === '1';
    }
    return false;
  });
  const [showMenuStock, setShowMenuStock] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [activeOrder, setActiveOrder] = useState<ActiveOrderInfo | null>(() => {
    try {
      const saved = JSON.parse(safeStorage.getItem('yemunnai_active_order') || 'null');
      return saved && typeof saved.token === 'string' && /^\d{3}$/.test(saved.token)
        && typeof saved.vendor === 'string' && typeof saved.status === 'string'
        && typeof saved.orderId === 'string' && /^[a-f0-9-]{36}$/i.test(saved.orderId) ? saved : null;
    } catch { return null; }
  });
  useEffect(() => {
    if (activeOrder) safeStorage.setItem('yemunnai_active_order', JSON.stringify(activeOrder));
    else safeStorage.removeItem('yemunnai_active_order');
  }, [activeOrder]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  // Professional launch splash: the logo animation plays on load, then the app opens by itself.
  const [showLaunchSplash, setShowLaunchSplash] = useState(true);
  useEffect(() => {
    setShowMenuStock(false);
    setIsAddEditOpen(false);
  }, [vendor?.vendorId]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Real-time synchronization: listen for vendor status updates on student's active order
  useEffect(() => {
    if (!activeOrder?.orderId) return;

    const unsubscribe = subscribeOrderStatus(activeOrder.orderId, (newStatus) => {
      if (newStatus === 'accepted') {
        playTapSound();
        setActiveOrder((prev) =>
          prev ? { ...prev, status: 'Preparing your order', stage: 'preparing' } : null
        );
        showToast(`🍳 ${activeOrder.vendor} accepted your order! Preparing now.`);
      } else if (newStatus === 'completed') {
        playSuccessChime();
        fireOrderConfetti();
        setActiveOrder((prev) =>
          prev ? { ...prev, status: 'Ready for pickup', stage: 'ready' } : null
        );
        showToast(`🔥 Order #${activeOrder.token} is READY for pickup at ${activeOrder.vendor}!`);
      } else if (newStatus === 'declined') {
        setActiveOrder((prev) =>
          prev ? { ...prev, status: 'Declined by shop', stage: 'declined' } : null
        );
        showToast(`❌ ${activeOrder.vendor} was unable to accept your order.`);
      }
    });

    return () => {
      unsubscribe();
    };
  }, [activeOrder?.orderId, activeOrder?.vendor, activeOrder?.token]);

  // Splash first: a clean brand animation, then straight into the app (no buttons needed).
  if (showLaunchSplash) {
    return (
      <div className="min-h-screen bg-[#02180A]">
        <BrandIntroSplash onStart={() => setShowLaunchSplash(false)} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0F1A15] text-slate-100">
      {/* Main Content Area */}
      <a className="skip-content" href="#main-content">Skip to menu</a>
      <main id="main-content" tabIndex={-1} className="w-full flex justify-center">
        {/* Toast Notification */}
        <div role="status" aria-live="polite" className="sr-only">{toastMessage || ''}</div>
        {toastMessage && (
          <div
            aria-hidden="true"
            className="fixed bottom-6 max-w-[calc(100%-32px)] z-50 bg-[#112019] text-white px-5 py-2.5 rounded-2xl text-xs font-bold shadow-2xl border border-emerald-400/40 flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4 text-amber-400" aria-hidden="true" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* 1. CONSUMER APP SCREEN */}
        {activePortal === 'consumer' && (
          <MobileDeviceShell
            activeOrder={activeOrder}
            onClearActiveOrder={() => {
              playTapSound();
              setActiveOrder(null);
            }}
          >
            <Suspense fallback={<ScreenFallback />}>
              <div className="relative">
                {consumerFlow === 'location' ? (
                  <div className="relative">
                    <LocationPermissionScreen
                      onAllow={() => {
                        playSuccessChime();
                        setConsumerFlow('discovery');
                        showToast('📍 Campus Radar Enabled • Live MITS Canteen Updates');
                      }}
                      onManual={() => {
                        playTapSound();
                        setConsumerFlow('discovery');
                        showToast('📍 Campus Center Selected');
                      }}
                    />
                  </div>
                ) : selectedDetailFood ? (
                  <FoodItemDetailScreen
                    item={selectedDetailFood}
                    onBack={() => setSelectedDetailFood(null)}
                    onMap={() => {
                      setSelectedWalkInFood(selectedDetailFood);
                      setSelectedDetailFood(null);
                    }}
                    onOrder={(qty) => {
                      setSelectedOrderQty(qty);
                      setSelectedOrderFood(selectedDetailFood);
                      setSelectedDetailFood(null);
                    }}
                  />
                ) : (
                  <HomeDiscoveryScreen
                    cartCount={cartCount}
                    onBusinessPortal={() => {
                      playTapSound();
                      setActivePortal('business');
                    }}
                    onOrderNow={(item) => {
                      playTapSound();
                      setSelectedOrderQty(1);
                      setSelectedOrderFood(item);
                    }}
                    onWalkIn={(item) => {
                      playTapSound();
                      setSelectedWalkInFood(item);
                    }}
                    onReview={(item) => {
                      playTapSound();
                      setSelectedReviewFood(item);
                    }}
                    onCartClick={() => {
                      playTapSound();
                      if (selectedOrderFood) {
                        // Already has order modal open
                      } else if (cartCount > 0) {
                        setSelectedOrderQty(cartCount);
                        setSelectedOrderFood(DEFAULT_ORDER_ITEM);
                      } else {
                        showToast('Your cart is empty — tap + ORDER on any canteen item!');
                      }
                    }}
                    onSelectShop={(name) => {
                      playTapSound();
                      showToast(`Filtered by ${name}`);
                    }}
                    onSelectItem={(item) => {
                      playTapSound();
                      setSelectedDetailFood(item);
                    }}
                  />
                )}

                {/* Quick Order Modal — sits stably on top of screen with synced quantity */}
                {selectedOrderFood && <QuickOrderModal
                  isOpen={!!selectedOrderFood}
                  item={selectedOrderFood}
                  initialQty={selectedOrderQty}
                  onClose={() => setSelectedOrderFood(null)}
                  onSuccess={(orderData) => {
                    setCartCount(c => c + selectedOrderQty);
                    setActiveOrder({
                      token: orderData.token,
                      orderId: orderData.orderId,
                      vendor: orderData.vendor,
                      status: 'Sent to shop',
                      stage: 'sent'
                    });
                    showToast(`Token #${orderData.token} pinned. Check the live status above.`);
                  }}
                />}

                {/* Walk-in Map Modal */}
                {selectedWalkInFood && <WalkInMapModal
                  isOpen={!!selectedWalkInFood}
                  item={selectedWalkInFood}
                  onClose={() => setSelectedWalkInFood(null)}
                />}

                {/* Feedback Modal */}
                {selectedReviewFood && <FeedbackModal
                  isOpen={!!selectedReviewFood}
                  item={selectedReviewFood}
                  onClose={() => setSelectedReviewFood(null)}
                  onSubmitSuccess={() => {
                    showToast(`Review published for ${selectedReviewFood?.name}!`);
                  }}
                />}
              </div>
            </Suspense>
          </MobileDeviceShell>
        )}

        {/* 2. BUSINESS PORTAL SCREEN — reachable via ?portal=business (vendor login) */}
        {activePortal === 'business' && (
          <MobileDeviceShell>
            <Suspense fallback={<ScreenFallback />}>
              <div className="relative">
                {vendor && showMenuStock ? (
                  <div className="relative">
                    <MenuStockManagementScreen
                      onBack={() => setShowMenuStock(false)}
                      onAddNewItem={() => setIsAddEditOpen(true)}
                      onToggleStock={(id, inStock) => {
                        showToast(`Item #${id} stock ${inStock ? 'marked LIVE' : 'marked SOLD OUT'}`);
                      }}
                    />
                  </div>
                ) : (
                  <BusinessDashboardScreen
                    onAddNewItem={() => setIsAddEditOpen(true)}
                    onManageStock={() => setShowMenuStock(true)}
                  />
                )}

                {/* Add/Edit Food Item Modal */}
                <AddEditFoodItemScreen
                  isOpen={!!vendor && isAddEditOpen}
                  onClose={() => setIsAddEditOpen(false)}
                  onPublished={(item) => {
                    showToast(`Successfully published ${item.name} (₹${item.price}) to YEMEMUNNAI!`);
                  }}
                />
              </div>
            </Suspense>
          </MobileDeviceShell>
        )}

        {/* 3. DESIGN ARTIFACTS & DELIVERABLES */}
        {/* 4. SCREEN GALLERY — all 12 SVG screens built as live React components */}
        {activePortal === 'gallery' && (
          <div className="w-full max-w-4xl bg-[#1A2620] rounded-3xl p-6 border border-emerald-900/50 shadow-2xl space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-emerald-900/60">
              <div>
                <h2 className="text-base font-black text-white">Live Screen Gallery</h2>
                <p className="text-xs text-slate-400">Every Figma screen rebuilt 1:1 as interactive React — tap through each one.</p>
              </div>
              <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300">
                12 screens
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {([
                {
                  n: '01 · Home Discovery',
                  d: 'Category pills, tactile deals, vendor cards — the live consumer home.',
                  action: () => setActivePortal('consumer'),
                  cta: 'Open screen'
                },
                {
                  n: '02 · Quick Order Modal',
                  d: 'Bottom sheet: order summary, mobile + address, confirm CTA.',
                  action: () => { setActivePortal('consumer'); setTimeout(() => setSelectedOrderFood(DEFAULT_ORDER_ITEM), 60); },
                  cta: 'Open modal'
                },
                {
                  n: '03 · Feedback Popup',
                  d: 'Star rating, like/dislike toggle, review textarea.',
                  action: () => { setActivePortal('consumer'); setTimeout(() => setSelectedReviewFood(DEFAULT_ORDER_ITEM), 60); },
                  cta: 'Open modal'
                },
                {
                  n: '04 · Business Dashboard',
                  d: 'Live stats, online toggle, realtime incoming orders.',
                  action: () => setActivePortal('business'),
                  cta: 'Open screen'
                },
                {
                  n: '05 · Add/Edit Food Item',
                  d: 'Title, category, price, veg toggle, photo upload, publish.',
                  action: () => { setActivePortal('business'); setTimeout(() => setIsAddEditOpen(true), 60); },
                  cta: 'Open sheet'
                },
                {
                  n: '06 · Walk-In Map Modal',
                  d: 'Schematic campus map, dashed route, ETA chip, Google Maps handoff.',
                  action: () => { setActivePortal('consumer'); setTimeout(() => setSelectedWalkInFood(DEFAULT_ORDER_ITEM), 60); },
                  cta: 'Open modal'
                },
                {
                  n: '07 · Mascot Logo',
                  d: 'Official mascot badge + wordmark (extracted to /images/NewLogo.svg).',
                  action: () => setActivePortal('artifacts'),
                  cta: 'View asset'
                },
                {
                  n: '10 · Food Item Detail',
                  d: 'Hero photo, vendor bar, portion selector, sticky order bar.',
                  action: () => { setActivePortal('consumer'); setTimeout(() => setSelectedDetailFood(DEFAULT_ORDER_ITEM), 60); },
                  cta: 'Open screen'
                },
                {
                  n: '11 · Menu & Stock Management',
                  d: 'Vendor console: stat strip, category pills, stock toggles, FAB.',
                  action: () => { setActivePortal('business'); setShowMenuStock(true); },
                  cta: 'Open screen'
                },
                {
                  n: '12 · Access Login & Keypad',
                  d: 'Role tabs, roll/email field, PIN boxes, tactile numpad.',
                  action: () => { setActivePortal('business'); setTimeout(() => document.dispatchEvent(new CustomEvent('open-vendor-login')), 60); },
                  cta: 'Open screen'
                }
              ] as Array<{ n: string; d: string; action: () => void; cta: string }>).map(card => (
                <div key={card.n} className="p-4 bg-[#131D17] border border-emerald-900/40 rounded-2xl flex flex-col justify-between hover:border-emerald-700/60 transition-colors">
                  <div>
                    <span className="text-xs font-bold text-[#FFEAD9] block">{card.n}</span>
                    <p className="text-[10px] text-slate-400 mt-1 line-clamp-2">{card.d}</p>
                  </div>
                  <button
                    onClick={card.action}
                    className="mt-3 w-full py-2 rounded-lg bg-[#FE7200] hover:bg-[#0B5422] text-white text-[11px] font-bold cursor-pointer transition-colors"
                  >
                    {card.cta}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {activePortal === 'artifacts' && (
          <div className="w-full max-w-4xl bg-[#1A2620] rounded-3xl p-6 border border-emerald-900/50 shadow-2xl space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-emerald-900/60">
              <div>
                <h2 className="text-base font-black text-white">Official Design Deliverables (SVG Pack)</h2>
                <p className="text-xs text-slate-400">7 self-contained vector assets with embedded typography and reference imagery (375 × 812).</p>
              </div>
              <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300">
                Official Pack v1.0
              </span>
            </div>

            {/* Master Overview Preview */}
            <div className="bg-[#121A15] p-4 rounded-[18px] border border-emerald-950 flex flex-col items-center">
              <div className="w-full flex items-center justify-between mb-3 px-1">
                <span className="text-xs font-bold text-slate-300">Full Design Artboard Overview</span>
                <a 
                  href="/svgs/preview.png" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-[11px] text-[#FFEAD9] hover:underline flex items-center gap-1 font-semibold"
                >
                  <Eye className="w-3.5 h-3.5" />
                  View Full Res
                </a>
              </div>
              <img 
                src="/svgs/preview.png" 
                alt="YEMEMUNNAI SVG Pack Preview" 
                className="rounded-xl shadow-lg max-w-full border border-emerald-950/80"
              />
            </div>

            {/* Standalone SVG Deliverables */}
            <div className="pt-2">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-extrabold text-white">Standalone SVG Screens &amp; Assets</h3>
                <span className="text-[11px] text-slate-400 font-mono">figma_svgs/ &amp; public/svgs/</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                {[
                  { name: '01_home_discovery_feed.svg', preview: '01_home_discovery_feed.png', label: '01. Home Discovery Feed', desc: 'Category pills, tactile deals, vendor cards' },
                  { name: '02_quick_order_modal.svg', preview: '02_quick_order_modal.png', label: '02. Quick Order Modal', desc: 'Portion selector, live total & checkout' },
                  { name: '03_feedback_popup.svg', preview: '03_feedback_popup.png', label: '03. Feedback Popup', desc: 'Star rating, tags, comment submission' },
                  { name: '04_business_dashboard.svg', preview: '04_business_dashboard.png', label: '04. Business Dashboard', desc: 'Live stats, toggle stock, item listings' },
                  { name: '05_add_edit_food_item.svg', preview: '05_add_edit_food_item.png', label: '05. Add/Edit Food Item', desc: 'Title, price, category form sheet' },
                  { name: '06_walk_in_map_modal.svg', preview: '06_walk_in_map_modal.png', label: '06. Walk-In Map Modal', desc: 'Campus buildings, walking route & time' },
                  { name: '07_mascot_logo.svg', preview: '07_mascot_logo.png', label: '07. Official Mascot Logo', desc: 'Preserved sage badge & illustration' },
                  { name: '08_splash_onboarding.svg', preview: '08_splash_onboarding.png', label: '08. Splash & Onboarding', desc: 'Brand mascot, campus selector, quick-start CTA' },
                  { name: '09_location_permission.svg', preview: '09_location_permission.png', label: '09. Location & Geofence', desc: 'Campus radar dialog, walking time calculations' },
                  { name: '10_food_item_detail.svg', preview: '10_food_item_detail.png', label: '10. Food Item Detail', desc: 'Hero photo, portion size, live pot status' },
                  { name: '11_menu_stock_management.svg', preview: '11_menu_stock_management.png', label: '11. Live Menu & Stock', desc: 'Stock toggles, sold out badges, metric strip' },
                  { name: '12_access_login.svg', preview: '12_access_login.png', label: '12. Access Login & Keypad', desc: 'Role switcher, roll number OTP & tactile numpad' },
                ].map((file) => (
                  <div key={file.name} className="p-3.5 bg-[#131D17] border border-emerald-900/40 rounded-2xl flex flex-col justify-between hover:border-emerald-700/60 transition-colors">
                    <div>
                      <div className="w-full h-40 bg-[#0B120E] rounded-xl overflow-hidden mb-3 border border-emerald-950/60 flex items-center justify-center p-1.5">
                        <img 
                          src={`/svgs/previews/${file.preview}`} 
                          alt={file.label} 
                          className="max-h-full max-w-full object-contain rounded-lg"
                        />
                      </div>
                      <span className="text-xs font-bold text-[#FFEAD9] block">{file.label}</span>
                      <p className="text-[10px] text-slate-400 mt-0.5 line-clamp-2">{file.desc}</p>
                      <span className="text-[9px] text-slate-500 font-mono block mt-1">{file.name}</span>
                    </div>

                    <div className="flex items-center gap-2 mt-3 pt-2.5 border-t border-emerald-950/60">
                      <a
                        href={`/svgs/${file.name}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 py-1.5 px-2.5 rounded-lg bg-emerald-900/40 hover:bg-emerald-800/50 text-[#FFEAD9] text-[10px] font-bold flex items-center justify-center gap-1 transition-colors"
                      >
                        <ExternalLink className="w-3 h-3" />
                        <span>Open SVG</span>
                      </a>
                      <a
                        href={`/svgs/${file.name}`}
                        download={file.name}
                        className="p-1.5 rounded-lg bg-emerald-900/30 hover:bg-emerald-800/40 text-slate-300 hover:text-white transition-colors"
                        title="Download SVG"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activePortal === '404' && (
          <Suspense fallback={<ScreenFallback />}>
            <ErrorPage />
          </Suspense>
        )}
      </main>

      {/* PWA install sheet — appears when the browser offers install */}
      <InstallPrompt />
    </div>
  );
}

export default App;
