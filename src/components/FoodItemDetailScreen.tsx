import React, { useState } from 'react';
import { ChevronLeft } from 'lucide-react';
import { MorphingButton } from './MorphingButton';
import { SaveToggle } from './SaveToggle';
import { Stepper } from './Stepper';
import type { FoodItem } from '../lib/types';

interface FoodItemDetailScreenProps {
  item: FoodItem | null;
  onBack?: () => void;
  onMap?: () => void;
  onOrder?: (qty: number) => void;
}

/**
 * Screen 10 — "Food Item Detail", 1:1 from
 * figma_svgs/10_food_item_detail.svg (375 × 812):
 *   - Top nav ........ back circle 36px #E8ECEF at (38,54) with chevron 24px;
 *                      "Item Details" 14 w800 centered (y=59); heart circle 36px at
 *                      (333,54) with orange heart path #F26A00
 *   - Hero ........... (20,95) 335×225 rx=24 #131F17 + photo slice; "🔥 Fresh Batch •
 *                      12 mins ago" pill 180×28 rx=12 #FE7200 11 w800 at (34,109);
 *                      "14 Left In Pot" pill 118×28 rx=12 #FF8A2A (warm shadow) at
 *                      (216,265), text 11 w800
 *   - Info ........... (20,335): name 20 w800 + "₹140" 22 w800 #FE7200 right-aligned;
 *                      "₹160" strike 12 w600 #8EA397; vendor bar 335×54 rx=14 #E8ECEF
 *                      stroke #D6DCE2 with 34px photo circle + name 12 w800 +
 *                      "★ 4.8 (128 ratings) • 160m (2 min walk)" 10 w600 + "Map 📍"
 *                      chip 62×24 rx=12 #D9E8DF 10 w700 #FE7200; 3 tags 24px high
 *                      (95/85/105 wide) rx=12 10 w700; portion selector label 11 w800
 *                      ls.5, options 162×42 rx=12 (#FE7200 active / #E8ECEF inactive)
 *                      12 w800/w700 with prices; kitchen note 335×54 rx=14
 *   - Bottom bar ..... (0,695) 375×117 #E8ECEF stroke #D6DCE2; stepper 105×48 rx=12
 *                      #E8ECEF stroke #BACFC2 (−/1/+ 18/15/18 w800); CTA 217×48 rx=12
 *                      emerald gradient "Quick Order • ₹140" 14 w800
 */
export const FoodItemDetailScreen: React.FC<FoodItemDetailScreenProps> = ({
  item,
  onBack,
  onMap,
  onOrder
}) => {
  const [qty, setQty] = useState(1);
  const [portion, setPortion] = useState<'single' | 'double'>('single');
  const [favorited, setFavorited] = useState(false);

  if (!item) return null;

  // Shop photos keyed by vendor name — mirrors LOCAL_SHOPS in src/lib/mockData.ts
  const SHOP_IMAGES: Record<string, string> = {
    'MITS Canteen': '/images/shop_mits_canteen.jpg',
    'MITS Cafe': '/images/shop_mits_cafe.jpg',
    "Ekdant's Cafe": '/images/shop_ekdants_cafe.jpg',
    Lickies: '/images/shop_lickies.jpg',
    'New Cafe': '/images/shop_new_cafe.jpg'
  };
  const vendorImage = SHOP_IMAGES[item.vendor] ?? '/images/shop_mits_canteen.jpg';

  // Tags that match what the item actually is (drinks / packed snacks / fried snacks)
  const isDrink = /tea|coffee|milk/i.test(item.name);
  const isPacked = /batanees|popsicle|chips|lays|biscuit/i.test(item.name);
  const TAGS: Array<{ label: string; w: number }> = isPacked
    ? [{ label: '📦 Sealed Pack', w: 95 }, { label: '✨ Hygienic', w: 85 }, { label: '🏫 Campus Fav', w: 105 }]
    : isDrink
      ? [{ label: '☕ Served Hot', w: 95 }, { label: '🌿 Fresh Brew', w: 85 }, { label: '👥 Student Fav', w: 105 }]
      : [{ label: '🔥 Fried Fresh', w: 95 }, { label: '🌶️ Spiced', w: 85 }, { label: '🍟 Evening Special', w: 105 }];

  const unitPrice = portion === 'single' ? item.price : Math.round(item.price * 2 * 0.93);
  const total = unitPrice * qty;

  return (
    <div className="relative w-full max-w-97.5 mx-auto bg-[#E8ECEF] h-203 select-none overflow-hidden shadow-2xl rounded-[36px] border border-[#D6DCE2] font-sans">
      {/* Top nav — circles at (38,54) and (351,54), title baseline y=59 */}
      <div className="absolute left-5 top-9 flex items-center">
        <button
          type="button"
          onClick={onBack}
          aria-label="Back"
          className="w-9 h-9 rounded-full bg-[#E8ECEF] border border-white flex items-center justify-center cursor-pointer"
          style={{ boxShadow: '-3px -3px 7px rgba(255,255,255,0.8), 4px 4px 8px rgba(163,174,187,0.4)' }}
        >
          <ChevronLeft className="w-6 h-6 text-[#1F140A]" strokeWidth={2} />
        </button>
        <span className="absolute left-37.25 text-[14px] font-extrabold text-[#1F140A]">
          Item Details
        </span>
        <div className="absolute right-5 flex items-center">
          <SaveToggle
            size="sm"
            idleText="Save"
            savedText="Saved"
            isSaved={favorited}
            onToggle={setFavorited}
          />
        </div>
      </div>

      {/* Hero — (20,95) 335×225 rx=24 */}
      <div
        className="absolute left-5 top-23.75 w-83.75 h-56.25 rounded-3xl overflow-hidden bg-[#131F17]"
        style={{ boxShadow: '-6px -6px 12px rgba(255,255,255,0.85), 6px 6px 12px rgba(163,174,187,0.45)' }}
      >
        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
        {/* Fresh batch pill — (14,14) 180×28 rx=12 */}
        <div
          className="absolute left-3.5 top-3.5 px-3 h-7 rounded-xl bg-[#FE7200] flex items-center justify-center"
          style={{ boxShadow: '-3px -3px 7px rgba(255,255,255,0.8), 4px 4px 8px rgba(163,174,187,0.4)' }}
        >
          <span className="text-[11px] font-extrabold text-white">{item.freshnessTag ?? (isDrink ? '☕ Fresh Brew' : isPacked ? '📦 Sealed Pack' : '🔥 In Stock')}</span>
        </div>
        {/* Stock pill — hidden when the shop publishes no live count */}
        {item.stockLeft != null && (
          <div
            className="absolute left-49 top-42.5 w-29.5 h-7 rounded-xl bg-[#FF8A2A] flex items-center justify-center shadow-md"
            style={{ boxShadow: '-3px -3px 7px rgba(255,255,255,0.8), 4px 4px 9px rgba(199,123,58,0.4)' }}
          >
            <span className="text-[11px] font-extrabold text-white">{item.stockLeft} Left In Stock</span>
          </div>
        )}
      </div>

      {/* Item info — origin (20,335) */}
      <div className="absolute left-5 top-83.75 w-83.75">
        {/* Name / price — baseline y=359 (24px in) */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 max-w-57.5">
            <span
              className={`w-3.5 h-3.5 border ${item.isVeg !== false ? 'border-emerald-700' : 'border-amber-800'} flex items-center justify-center p-0.5 rounded-xs shrink-0 bg-white/50`}
              title={item.isVeg !== false ? 'Vegetarian' : 'Non-Vegetarian'}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${item.isVeg !== false ? 'bg-emerald-700' : 'bg-amber-800'}`} />
            </span>
            <h1 className="text-[20px] font-extrabold text-[#1F140A] leading-6 truncate">
              {item.name}
            </h1>
          </div>
          <span className={`font-extrabold ${item.price > 0 ? 'text-[22px] text-[#FE7200]' : 'text-[14px] text-[#D96C37] bg-amber-500/10 px-2.5 py-1 rounded-md border border-amber-500/25'}`}>
            {item.price > 0 ? `₹${item.price}` : 'Coming Soon'}
          </span>
        </div>
        {/* Strike price — only when the item actually carries one */}
        {item.originalPrice != null && (
          <p className="text-right text-[12px] font-semibold text-[#8EA397] line-through mt-px">
            ₹{item.originalPrice}
          </p>
        )}

        {/* Vendor bar — y offset 52, 335×54 rx=14 */}
        <div
          className="mt-2.5 w-full h-13.5 rounded-[14px] bg-[#E8ECEF] border border-[#D6DCE2] relative"
        >
          <div className="absolute left-3 top-2.5 w-8.5 h-8.5 rounded-full bg-[#FE7200] overflow-hidden">
            <img
              src={vendorImage}
              alt={item.vendor}
              className="w-full h-full object-cover"
            />
          </div>
          <p className="absolute left-13.5 top-3.25 text-[12px] font-extrabold text-[#1F140A]">
            {item.vendor}
          </p>
          <p className="absolute left-13.5 top-7.25 text-[10px] font-semibold text-[#7A6658]">
            {item.reviews && item.reviews > 0 && item.rating != null
              ? `★ ${Number(item.rating).toFixed(1)} (${item.reviews} ratings) • `
              : 'New • '}
            {item.locationLandmark ?? item.walkTime ?? 'Campus Center'}
          </p>
          <button
            type="button"
            onClick={onMap}
            className="absolute left-65 top-3.75 w-15.5 h-6 rounded-xl bg-[#D6DCE2] flex items-center justify-center cursor-pointer hover:bg-[#C9DEd2] transition-colors"
          >
            <span className="text-[10px] font-bold text-[#FE7200]">Map 📍</span>
          </button>
        </div>

        {/* Tags — y offset 120, heights 24, widths 95/85/105 */}
        <div className="mt-3.5 flex gap-1.75">
          {TAGS.map(tag => (
            <span
              key={tag.label}
              style={{ width: tag.w }}
              className="h-6 rounded-xl bg-[#E8ECEF] border border-[#D6DCE2] flex items-center justify-center text-[10px] font-bold text-[#1F140A] whitespace-nowrap overflow-hidden"
            >
              {tag.label}
            </span>
          ))}
        </div>

        {/* Portion selector — label y offset 174; options y offset 184 */}
        <p className="mt-6.5 text-[11px] font-extrabold tracking-[0.5px] text-[#1F140A]">
          SELECT PORTION SIZE
        </p>
        <div className="mt-2.5 flex gap-2.75">
          <button
            type="button"
            onClick={() => setPortion('single')}
            aria-pressed={portion === 'single'}
            className={`w-40.5 h-10.5 rounded-xl flex items-center justify-between px-5 cursor-pointer transition-all ${
              portion === 'single'
                ? 'bg-[#FE7200] text-white btn-orange-shadow'
                : 'bg-[#E8ECEF] border border-[#D6DCE2] text-[#1F140A]'
            }`}
          >
            <span className="text-[12px] font-extrabold">Single Plate</span>
            <span className="text-[12px] font-extrabold">{item.price > 0 ? `₹${item.price}` : 'Coming Soon'}</span>
          </button>
          <button
            type="button"
            onClick={() => setPortion('double')}
            aria-pressed={portion === 'double'}
            className={`w-40.5 h-10.5 rounded-xl flex items-center justify-between px-5 cursor-pointer transition-all ${
              portion === 'double'
                ? 'bg-[#FE7200] text-white btn-orange-shadow'
                : 'bg-[#E8ECEF] border border-[#D6DCE2] text-[#1F140A]'
            }`}
          >
            <span className="text-[12px] font-bold">Double Feast</span>
            <span className={`text-[12px] font-bold ${portion === 'double' ? 'text-white' : 'text-[#7A6658]'}`}>
              {item.price > 0 ? `₹${Math.round(item.price * 2 * 0.93)}` : 'Coming Soon'}
            </span>
          </button>
        </div>

        {/* Kitchen note — y offset 245, 335×54 rx=14 */}
        <div className="mt-4.75 w-full h-13.5 rounded-[14px] bg-[#E8ECEF] border border-[#D6DCE2] px-3.5 py-2">
          <p className="text-[11px] font-extrabold text-[#1F140A]">
            Kitchen Status: {!item.inStock
              ? '🔴 Currently Sold Out • Back soon'
              : item.isShopOnline === false
              ? '🔴 Canteen Offline • Not accepting orders'
              : (item.freshnessTag ?? (isDrink ? 'Freshly Brewed' : isPacked ? 'Sealed & Fresh' : 'In Stock & Ready'))}
          </p>
          <p className="mt-0.75 text-[10px] font-medium text-[#7A6658]">
            Available at {item.vendor} • {item.locationLandmark ?? item.walkTime ?? 'Campus Center'}
          </p>
        </div>
      </div>

      {/* Bottom order bar — (0,695) 375×117 */}
      <div
        className="absolute left-0 right-0 top-173.75 h-29.25 bg-[#E8ECEF]"
        style={{ borderTop: '1.5px solid #D6DCE2', boxShadow: '0 -6px 12px rgba(255,255,255,0.7), 0 6px 12px rgba(163,174,187,0.4)' }}
      >
        {/* Stepper — (20,707) 105×48 rx=12 */}
        <div className="absolute left-5 top-3 w-26.25 h-12 flex items-center justify-center">
          <Stepper
            min={1}
            max={20}
            value={qty}
            onChange={setQty}
            disabled={!item.inStock || item.isShopOnline === false}
            size="md"
            className="w-full h-12 rounded-xl"
          />
        </div>

        {/* CTA — (138,707) 217×48 rx=12 */}
        {!item.inStock ? (
          <div className="absolute left-34.5 top-3 w-54.25 h-12 flex items-center justify-center">
            <MorphingButton
              buttonText="Notify Restock"
              onSubmit={(email) => {
                alert(`You will be notified at ${email} when ${item.name} is back in stock!`);
              }}
            />
          </div>
        ) : item.isShopOnline === false ? (
          <div className="absolute left-34.5 top-3 w-54.25 h-12 flex items-center justify-center">
            <MorphingButton
              buttonText="Alert Me"
              onSubmit={(email) => {
                alert(`You will be alerted at ${email} when this canteen comes online!`);
              }}
            />
          </div>
        ) : (
          <button
            type="button"
            onClick={() => onOrder?.(qty)}
            className="absolute left-34.5 top-3 w-54.25 h-12 rounded-xl text-white text-[14px] font-extrabold cursor-pointer hover:brightness-110 active:scale-[0.98] transition-all"
            style={{
              background: 'linear-gradient(180deg, #FE7200 0%, #E05D00 100%)',
              boxShadow: '-3px -3px 7px rgba(255,255,255,0.8), 4px 4px 8px rgba(163,174,187,0.4)'
            }}
          >
            Quick Order{total > 0 ? ` • ₹${total}` : ' (Coming Soon)'}
          </button>
        )}
      </div>
    </div>
  );
};
