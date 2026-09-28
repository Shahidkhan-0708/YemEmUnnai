import { useState } from 'react';
import { HomeDiscoveryScreen } from './components/HomeDiscoveryScreen';
import type { FoodItem } from './lib/types';
import { QuickOrderModal } from './components/QuickOrderModal';
import { FeedbackModal } from './components/FeedbackModal';
import { WalkInMapModal } from './components/WalkInMapModal';
import { BusinessDashboardScreen } from './components/BusinessDashboardScreen';
import { AddEditFoodItemScreen } from './components/AddEditFoodItemScreen';
import { SplashOnboardingScreen } from './components/SplashOnboardingScreen';
import { LocationPermissionScreen } from './components/LocationPermissionScreen';
import { FoodItemDetailScreen } from './components/FoodItemDetailScreen';
import { MenuStockManagementScreen } from './components/MenuStockManagementScreen';
import { MobileDeviceShell, type ActiveOrderInfo } from './components/MobileDeviceShell';
import { playTapSound } from './lib/celebration';
import { Utensils, Store, Image as ImageIcon, Sparkles, Download, ExternalLink, Eye, LayoutGrid } from 'lucide-react';

/** Stand-in item used by the Screen Gallery to open modals/screens without the grid. */
const DEFAULT_ORDER_ITEM: FoodItem = {
  id: 'gallery-demo',
  vendorId: 'demo',
  name: 'Samosa',
  vendor: 'MITS Canteen',
  price: 20,
  category: 'cooked',
  image: '/images/samosa.jpg',
  likes: 45,
  dislikes: 2,
  reviews: 3,
  rating: 4.5,
  walkTime: '5 min walk',
  actionType: 'order',
  inStock: true
};

export function App() {
  const [activePortal, setActivePortal] = useState<'consumer' | 'business' | 'artifacts' | 'gallery'>('consumer');
  
  // Modals state
  const [selectedOrderFood, setSelectedOrderFood] = useState<FoodItem | null>(null);
  const [selectedWalkInFood, setSelectedWalkInFood] = useState<FoodItem | null>(null);
  const [selectedReviewFood, setSelectedReviewFood] = useState<FoodItem | null>(null);
  const [selectedDetailFood, setSelectedDetailFood] = useState<FoodItem | null>(null);
  const [isAddEditOpen, setIsAddEditOpen] = useState(false);
  const [showSplash, setShowSplash] = useState(false);
  const [showLocation, setShowLocation] = useState(false);
  const [showMenuStock, setShowMenuStock] = useState(false);
  const [cartCount, setCartCount] = useState(2);
  const [activeOrder, setActiveOrder] = useState<ActiveOrderInfo | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  return (
    <div className="min-h-screen bg-[#111A15] text-slate-100 flex flex-col items-center py-6 px-3">
      {/* Top Header / Brand Bar */}
      <header className="w-full max-w-4xl flex flex-col md:flex-row items-center justify-between gap-4 pb-6 border-b border-emerald-950/60 mb-6">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-[#09431B] border border-emerald-600/40 p-1 flex items-center justify-center shadow-lg overflow-hidden">
            <img src="/images/logo.png" alt="YemEmUnnai Logo" className="w-full h-full object-contain" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-black text-white tracking-tight">YEMEMUNNAI</h1>
              <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                Live UI
              </span>
            </div>
            <p className="text-xs text-[#5C7A6D]">Hyperlocal Real-time Food Discovery • Tactile Mint UI</p>
          </div>
        </div>

        {/* Portal Switcher Tabs */}
        <div className="flex items-center p-1 rounded-full bg-[#18261F] border border-emerald-900/50 shadow-inner">
          <button
            onClick={() => setActivePortal('consumer')}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer ${
              activePortal === 'consumer'
                ? 'bg-[#09431B] text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Utensils className="w-3.5 h-3.5" />
            <span>Consumer App</span>
          </button>

          <button
            onClick={() => setActivePortal('business')}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer ${
              activePortal === 'business'
                ? 'bg-[#09431B] text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Store className="w-3.5 h-3.5" />
            <span>Business Portal</span>
          </button>

          <button
            onClick={() => setActivePortal('artifacts')}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer ${
              activePortal === 'artifacts'
                ? 'bg-[#09431B] text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <ImageIcon className="w-3.5 h-3.5" />
            <span>Figma SVGs &amp; Ref</span>
          </button>

          <button
            onClick={() => setActivePortal('gallery')}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer ${
              activePortal === 'gallery'
                ? 'bg-[#09431B] text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span>Screen Gallery</span>
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="w-full flex justify-center">
        {/* Toast Notification */}
        {toastMessage && (
          <div
            role="status"
            aria-live="polite"
            className="fixed top-6 z-50 bg-[#09431B] text-white px-5 py-2.5 rounded-full text-xs font-extrabold shadow-2xl border border-emerald-400/40 animate-in fade-in slide-in-from-top-4 flex items-center gap-2"
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
            <div className="relative">
              <HomeDiscoveryScreen
                cartCount={cartCount}
                onOrderNow={(item) => {
                  playTapSound();
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
                  showToast(`Cart has ${cartCount} items ready for checkout`);
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

              {/* Quick Order Modal */}
              <QuickOrderModal
                isOpen={!!selectedOrderFood}
                item={selectedOrderFood}
                onClose={() => setSelectedOrderFood(null)}
                onSuccess={(orderData) => {
                  setCartCount(c => c + 1);
                  setActiveOrder(orderData);
                  showToast(`Token #${orderData.token} pinned to Dynamic Island!`);
                }}
              />

              {/* Walk-in Map Modal */}
              <WalkInMapModal
                isOpen={!!selectedWalkInFood}
                item={selectedWalkInFood}
                onClose={() => setSelectedWalkInFood(null)}
              />

              {/* Feedback Modal */}
              <FeedbackModal
                isOpen={!!selectedReviewFood}
                item={selectedReviewFood}
                onClose={() => setSelectedReviewFood(null)}
                onSubmitSuccess={() => {
                  showToast(`Review published for ${selectedReviewFood?.name}!`);
                }}
              />

              {/* Food Item Detail (full screen, screen 10) */}
              {selectedDetailFood && (
                <div className="absolute inset-0 z-40">
                  <FoodItemDetailScreen
                    item={selectedDetailFood}
                    onBack={() => setSelectedDetailFood(null)}
                    onMap={() => {
                      setSelectedWalkInFood(selectedDetailFood);
                      setSelectedDetailFood(null);
                    }}
                    onOrder={(qty) => {
                      setCartCount(c => c + qty);
                      setSelectedOrderFood(selectedDetailFood);
                      setSelectedDetailFood(null);
                    }}
                  />
                </div>
              )}
            </div>
          </MobileDeviceShell>
        )}

        {/* 2. BUSINESS PORTAL SCREEN */}
        {activePortal === 'business' && (
          <MobileDeviceShell>
            <div className="relative">
              <BusinessDashboardScreen
                onAddNewItem={() => setIsAddEditOpen(true)}
              />

              {/* Add/Edit Food Item Modal */}
              <AddEditFoodItemScreen
                isOpen={isAddEditOpen}
                onClose={() => setIsAddEditOpen(false)}
                onPublished={(item) => {
                  showToast(`Successfully published ${item.name} (₹${item.price}) to YEMEMUNNAI!`);
                }}
              />
            </div>
          </MobileDeviceShell>
        )}

        {/* 3. DESIGN ARTIFACTS & DELIVERABLES */}
        {/* 4. SCREEN GALLERY — all 12 SVG screens built as live React components */}
        {activePortal === 'gallery' && (
          <div className="w-full max-w-4xl bg-[#1A2620] rounded-[24px] p-6 border border-emerald-900/50 shadow-2xl space-y-6">
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
                  d: 'Official mascot badge + wordmark (extracted to /images/mascot.png).',
                  action: () => setActivePortal('artifacts'),
                  cta: 'View asset'
                },
                {
                  n: '08 · Splash & Onboarding',
                  d: 'Mascot hero card, campus address, hours, explore CTA.',
                  action: () => setShowSplash(true),
                  cta: 'Open screen'
                },
                {
                  n: '09 · Location Permission',
                  d: 'Radar illustration, walk-time + alerts fields, allow CTA.',
                  action: () => setShowLocation(true),
                  cta: 'Open screen'
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
                  action: () => setShowMenuStock(true),
                  cta: 'Open screen'
                },
                {
                  n: '12 · Access Login & Keypad',
                  d: 'Role tabs, roll/email field, PIN boxes, tactile numpad.',
                  action: () => { setActivePortal('business'); setTimeout(() => document.dispatchEvent(new CustomEvent('open-vendor-login')), 60); },
                  cta: 'Open screen'
                }
              ] as Array<{ n: string; d: string; action: () => void; cta: string }>).map(card => (
                <div key={card.n} className="p-4 bg-[#131D17] border border-emerald-900/40 rounded-[16px] flex flex-col justify-between hover:border-emerald-700/60 transition-colors">
                  <div>
                    <span className="text-xs font-bold text-[#A7F3D0] block">{card.n}</span>
                    <p className="text-[10px] text-slate-400 mt-1 line-clamp-2">{card.d}</p>
                  </div>
                  <button
                    onClick={card.action}
                    className="mt-3 w-full py-2 rounded-lg bg-[#09431B] hover:bg-[#0B5422] text-white text-[11px] font-bold cursor-pointer transition-colors"
                  >
                    {card.cta}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {activePortal === 'artifacts' && (
          <div className="w-full max-w-4xl bg-[#1A2620] rounded-[24px] p-6 border border-emerald-900/50 shadow-2xl space-y-6">
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
                  className="text-[11px] text-[#A7F3D0] hover:underline flex items-center gap-1 font-semibold"
                >
                  <Eye className="w-3.5 h-3.5" />
                  View Full Res
                </a>
              </div>
              <img 
                src="/svgs/preview.png" 
                alt="YEMEMUNNAI SVG Pack Preview" 
                className="rounded-[12px] shadow-lg max-w-full border border-emerald-950/80"
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
                  <div key={file.name} className="p-3.5 bg-[#131D17] border border-emerald-900/40 rounded-[16px] flex flex-col justify-between hover:border-emerald-700/60 transition-colors">
                    <div>
                      <div className="w-full h-40 bg-[#0B120E] rounded-xl overflow-hidden mb-3 border border-emerald-950/60 flex items-center justify-center p-1.5">
                        <img 
                          src={`/svgs/previews/${file.preview}`} 
                          alt={file.label} 
                          className="max-h-full max-w-full object-contain rounded-lg"
                        />
                      </div>
                      <span className="text-xs font-bold text-[#A7F3D0] block">{file.label}</span>
                      <p className="text-[10px] text-slate-400 mt-0.5 line-clamp-2">{file.desc}</p>
                      <span className="text-[9px] text-slate-500 font-mono block mt-1">{file.name}</span>
                    </div>

                    <div className="flex items-center gap-2 mt-3 pt-2.5 border-t border-emerald-950/60">
                      <a
                        href={`/svgs/${file.name}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 py-1.5 px-2.5 rounded-lg bg-emerald-900/40 hover:bg-emerald-800/50 text-[#A7F3D0] text-[10px] font-bold flex items-center justify-center gap-1 transition-colors"
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
      </main>

      {/* Full-screen gallery overlays (screens 08 / 09 / 11) */}
      {showSplash && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-start justify-center overflow-auto py-6 px-3">
          <div className="relative">
            <button
              onClick={() => setShowSplash(false)}
              className="absolute -top-2 -right-2 z-10 w-8 h-8 rounded-full bg-white text-[#0A2E20] text-sm font-black shadow-lg cursor-pointer hover:bg-slate-100"
              aria-label="Close preview"
            >
              ✕
            </button>
            <SplashOnboardingScreen
              onExplore={() => { setShowSplash(false); setActivePortal('consumer'); }}
              onBusinessPortal={() => { setShowSplash(false); setActivePortal('business'); }}
            />
          </div>
        </div>
      )}

      {showLocation && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-start justify-center overflow-auto py-6 px-3">
          <div className="relative">
            <button
              onClick={() => setShowLocation(false)}
              className="absolute -top-2 -right-2 z-10 w-8 h-8 rounded-full bg-white text-[#0A2E20] text-sm font-black shadow-lg cursor-pointer hover:bg-slate-100"
              aria-label="Close preview"
            >
              ✕
            </button>
            <LocationPermissionScreen
              onAllow={() => { setShowLocation(false); showToast('Campus Radar enabled — walking times are now live'); }}
              onManual={() => { setShowLocation(false); setActivePortal('consumer'); }}
            />
          </div>
        </div>
      )}

      {showMenuStock && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-start justify-center overflow-auto py-6 px-3">
          <div className="relative">
            <button
              onClick={() => setShowMenuStock(false)}
              className="absolute -top-2 -right-2 z-10 w-8 h-8 rounded-full bg-white text-[#0A2E20] text-sm font-black shadow-lg cursor-pointer hover:bg-slate-100"
              aria-label="Close preview"
            >
              ✕
            </button>
            <MenuStockManagementScreen
              onAddNewItem={() => { setShowMenuStock(false); setActivePortal('business'); setIsAddEditOpen(true); }}
              onToggleStock={(id, inStock) => showToast(`${id} marked ${inStock ? 'IN STOCK' : 'SOLD OUT'}`)}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
