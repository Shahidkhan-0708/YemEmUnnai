import React, { useState } from 'react';
import { ChevronLeft } from 'lucide-react';

interface FoodItemDetailScreenProps {
  item: {
    name: string;
    vendor: string;
    price: number;
    image: string;
    rating?: number;
    reviews?: number;
    walkTime?: string;
    inStock?: boolean;
  } | null;
  onBack?: () => void;
  onMap?: () => void;
  onOrder?: (qty: number) => void;
}

/**
 * Screen 10 — "Food Item Detail", 1:1 from
 * figma_svgs/10_food_item_detail.svg (375 × 812):
 *   - Top nav ........ back circle 36px #EFF5EF at (38,54) with chevron 24px;
 *                      "Item Details" 14 w800 centered (y=59); heart circle 36px at
 *                      (333,54) with orange heart path #F26A00
 *   - Hero ........... (20,95) 335×225 rx=24 #131F17 + photo slice; "🔥 Fresh Batch •
 *                      12 mins ago" pill 180×28 rx=12 #0A461E 11 w800 at (34,109);
 *                      "14 Left In Pot" pill 118×28 rx=12 #FF8A2A (warm shadow) at
 *                      (216,265), text 11 w800
 *   - Info ........... (20,335): name 20 w800 + "₹140" 22 w800 #0A461E right-aligned;
 *                      "₹160" strike 12 w600 #8EA397; vendor bar 335×54 rx=14 #EFF5EF
 *                      stroke #C8D8CE with 34px photo circle + name 12 w800 +
 *                      "★ 4.8 (128 ratings) • 160m (2 min walk)" 10 w600 + "Map 📍"
 *                      chip 62×24 rx=12 #D9E8DF 10 w700 #09431B; 3 tags 24px high
 *                      (95/85/105 wide) rx=12 10 w700; portion selector label 11 w800
 *                      ls.5, options 162×42 rx=12 (#09431B active / #EFF5EF inactive)
 *                      12 w800/w700 with prices; kitchen note 335×54 rx=14
 *   - Bottom bar ..... (0,695) 375×117 #EFF5EF stroke #C8D8CE; stepper 105×48 rx=12
 *                      #E5EDE9 stroke #BACFC2 (−/1/+ 18/15/18 w800); CTA 217×48 rx=12
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

  const unitPrice = portion === 'single' ? item.price : Math.round(item.price * 2 * 0.93); // ₹260 for ₹140 base ≈ mock
  const total = unitPrice * qty;

  return (
    <div className="relative w-full max-w-[390px] mx-auto bg-[#E8ECEF] h-[812px] select-none overflow-hidden shadow-2xl rounded-[36px] border border-[#D6DCE2] font-sans">
      {/* Top nav — circles at (38,54) and (351,54), title baseline y=59 */}
      <div className="absolute left-[20px] top-[36px] flex items-center">
        <button
          type="button"
          onClick={onBack}
          aria-label="Back"
          className="w-[36px] h-[36px] rounded-full bg-[#E8ECEF] border border-white flex items-center justify-center cursor-pointer"
          style={{ boxShadow: '-3px -3px 7px rgba(255,255,255,0.8), 4px 4px 8px rgba(163,174,187,0.4)' }}
        >
          <ChevronLeft className="w-[24px] h-[24px] text-[#0A2E20]" strokeWidth={2} />
        </button>
        <span className="absolute left-[149px] text-[14px] font-extrabold text-[#0A2E20]">
          Item Details
        </span>
        <button
          type="button"
          onClick={() => setFavorited(f => !f)}
          aria-label="Favorite"
          aria-pressed={favorited}
          className="absolute left-[295px] w-[36px] h-[36px] rounded-full bg-[#E8ECEF] border border-white flex items-center justify-center cursor-pointer"
          style={{ boxShadow: '-3px -3px 7px rgba(255,255,255,0.8), 4px 4px 8px rgba(163,174,187,0.4)' }}
        >
          <svg width="20" height="18" viewBox="0 0 26 24" aria-hidden>
            <path
              d="M13 4 C10 0 5 2 5 6 C5 11 13 15 13 15 C13 15 21 11 21 6 C21 2 16 0 13 4 Z"
              fill={favorited ? '#F26A00' : 'none'}
              stroke={favorited ? '#F26A00' : '#F26A00'}
              strokeWidth="2"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>

      {/* Hero — (20,95) 335×225 rx=24 */}
      <div
        className="absolute left-[20px] top-[95px] w-[335px] h-[225px] rounded-[24px] overflow-hidden bg-[#131F17]"
        style={{ boxShadow: '-6px -6px 12px rgba(255,255,255,0.85), 6px 6px 12px rgba(163,174,187,0.45)' }}
      >
        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
        {/* Fresh batch pill — (14,14) 180×28 rx=12 */}
        <div
          className="absolute left-[14px] top-[14px] w-[180px] h-[28px] rounded-[12px] bg-[#0A461E] flex items-center justify-center animate-scarcity"
          style={{ boxShadow: '-3px -3px 7px rgba(255,255,255,0.8), 4px 4px 8px rgba(163,174,187,0.4)' }}
        >
          <span className="text-[11px] font-extrabold text-white">🔥 Fresh Batch • 12 mins ago</span>
        </div>
        {/* Stock pill — (196,170) 118×28 rx=12 */}
        <div
          className="absolute left-[196px] top-[170px] w-[118px] h-[28px] rounded-[12px] bg-[#FF8A2A] flex items-center justify-center shadow-md"
          style={{ boxShadow: '-3px -3px 7px rgba(255,255,255,0.8), 4px 4px 9px rgba(199,123,58,0.4)' }}
        >
          <span className="text-[11px] font-extrabold text-white">14 Left In Pot</span>
        </div>
      </div>

      {/* Item info — origin (20,335) */}
      <div className="absolute left-[20px] top-[335px] w-[335px]">
        {/* Name / price — baseline y=359 (24px in) */}
        <div className="flex items-baseline justify-between">
          <h1 className="text-[20px] font-extrabold text-[#0A2E20] leading-[24px] truncate max-w-[210px]">
            {item.name}
          </h1>
          <span className="text-[22px] font-extrabold text-[#0A461E]">₹{item.price}</span>
        </div>
        {/* Strike price — baseline y=377 */}
        <p className="text-right text-[12px] font-semibold text-[#8EA397] line-through mt-[1px]">
          ₹{Math.round(item.price * 8 / 7)}
        </p>

        {/* Vendor bar — y offset 52, 335×54 rx=14 */}
        <div
          className="mt-[10px] w-full h-[54px] rounded-[14px] bg-[#E8ECEF] border border-[#D6DCE2] relative"
        >
          <div className="absolute left-[12px] top-[10px] w-[34px] h-[34px] rounded-full bg-[#09431B] overflow-hidden">
            <img
              src="/images/shop_canteen.jpg"
              alt={item.vendor}
              className="w-full h-full object-cover"
            />
          </div>
          <p className="absolute left-[54px] top-[13px] text-[12px] font-extrabold text-[#0A2E20]">
            {item.vendor}
          </p>
          <p className="absolute left-[54px] top-[29px] text-[10px] font-semibold text-[#5C7A6D]">
            ★ {item.rating ?? 4.8} ({item.reviews ?? 128} ratings) • 160m (2 min walk)
          </p>
          <button
            type="button"
            onClick={onMap}
            className="absolute left-[260px] top-[15px] w-[62px] h-[24px] rounded-[12px] bg-[#D6DCE2] flex items-center justify-center cursor-pointer hover:bg-[#C9DEd2] transition-colors"
          >
            <span className="text-[10px] font-bold text-[#09431B]">Map 📍</span>
          </button>
        </div>

        {/* Tags — y offset 120, heights 24, widths 95/85/105 */}
        <div className="mt-[14px] flex gap-[7px]">
          <span className="w-[95px] h-[24px] rounded-[12px] bg-[#E8ECEF] border border-[#D6DCE2] flex items-center justify-center text-[10px] font-bold text-[#0A2E20]">
            🍗 Tender Meat
          </span>
          <span className="w-[85px] h-[24px] rounded-[12px] bg-[#E8ECEF] border border-[#D6DCE2] flex items-center justify-center text-[10px] font-bold text-[#0A2E20]">
            🌶️ Mild Spicy
          </span>
          <span className="w-[105px] h-[24px] rounded-[12px] bg-[#E8ECEF] border border-[#D6DCE2] flex items-center justify-center text-[10px] font-bold text-[#0A2E20]">
            🍚 Basmati Rice
          </span>
        </div>

        {/* Portion selector — label y offset 174; options y offset 184 */}
        <p className="mt-[26px] text-[11px] font-extrabold tracking-[0.5px] text-[#0A2E20]">
          SELECT PORTION SIZE
        </p>
        <div className="mt-[10px] flex gap-[11px]">
          <button
            type="button"
            onClick={() => setPortion('single')}
            aria-pressed={portion === 'single'}
            className={`w-[162px] h-[42px] rounded-[12px] flex items-center justify-between px-[20px] cursor-pointer transition-all ${
              portion === 'single'
                ? 'bg-[#09431B] text-white btn-green-shadow'
                : 'bg-[#E8ECEF] border border-[#D6DCE2] text-[#0A2E20]'
            }`}
          >
            <span className="text-[12px] font-extrabold">Single Plate</span>
            <span className="text-[12px] font-extrabold">₹{item.price}</span>
          </button>
          <button
            type="button"
            onClick={() => setPortion('double')}
            aria-pressed={portion === 'double'}
            className={`w-[162px] h-[42px] rounded-[12px] flex items-center justify-between px-[20px] cursor-pointer transition-all ${
              portion === 'double'
                ? 'bg-[#09431B] text-white btn-green-shadow'
                : 'bg-[#E8ECEF] border border-[#D6DCE2] text-[#0A2E20]'
            }`}
          >
            <span className="text-[12px] font-bold">Double Feast</span>
            <span className={`text-[12px] font-bold ${portion === 'double' ? 'text-white' : 'text-[#5C7A6D]'}`}>
              ₹{Math.round(item.price * 2 * 0.93)}
            </span>
          </button>
        </div>

        {/* Kitchen note — y offset 245, 335×54 rx=14 */}
        <div className="mt-[19px] w-full h-[54px] rounded-[14px] bg-[#E8ECEF] border border-[#D6DCE2] px-[14px] py-[8px]">
          <p className="text-[11px] font-extrabold text-[#0A2E20]">
            Kitchen Status: Pot #2 Active
          </p>
          <p className="mt-[3px] text-[10px] font-medium text-[#5C7A6D]">
            Served hot with onion raita, mirchi ka salan, and boiled egg.
          </p>
        </div>
      </div>

      {/* Bottom order bar — (0,695) 375×117 */}
      <div
        className="absolute left-0 right-0 top-[695px] h-[117px] bg-[#E8ECEF]"
        style={{ borderTop: '1.5px solid #C8D8CE', boxShadow: '0 -6px 12px rgba(255,255,255,0.7), 0 6px 12px rgba(163,174,187,0.4)' }}
      >
        {/* Stepper — (20,707) 105×48 rx=12 */}
        <div className="absolute left-[20px] top-[12px] w-[105px] h-[48px] rounded-[12px] bg-[#E8ECEF] border border-[#C9D0D8] flex items-center justify-between px-[10px]">
          <button
            type="button"
            onClick={() => setQty(q => Math.max(1, q - 1))}
            aria-label="Decrease quantity"
            className="w-[24px] h-[30px] flex items-center justify-center text-[18px] font-extrabold text-[#0A2E20] cursor-pointer active:scale-90 transition-transform"
          >
            −
          </button>
          <span className="text-[15px] font-extrabold text-[#0A2E20]">{qty}</span>
          <button
            type="button"
            onClick={() => setQty(q => Math.min(20, q + 1))}
            aria-label="Increase quantity"
            className="w-[24px] h-[30px] flex items-center justify-center text-[18px] font-extrabold text-[#0A2E20] cursor-pointer active:scale-90 transition-transform"
          >
            +
          </button>
        </div>

        {/* CTA — (138,707) 217×48 rx=12 */}
        <button
          type="button"
          onClick={() => onOrder?.(qty)}
          className="absolute left-[138px] top-[12px] w-[217px] h-[48px] rounded-[12px] text-white text-[14px] font-extrabold cursor-pointer hover:brightness-110 active:scale-[0.98] transition-all"
          style={{
            background: 'linear-gradient(180deg, #0A461E 0%, #063214 100%)',
            boxShadow: '-3px -3px 7px rgba(255,255,255,0.8), 4px 4px 8px rgba(163,174,187,0.4)'
          }}
        >
          Quick Order • ₹{total}
        </button>
      </div>
    </div>
  );
};
