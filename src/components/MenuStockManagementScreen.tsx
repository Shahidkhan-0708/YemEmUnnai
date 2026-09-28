import React, { useState } from 'react';
import { Plus } from 'lucide-react';

interface StockItem {
  id: string;
  name: string;
  price: number;
  note: string;
  inStock: boolean;
  image?: string;
  emoji?: string;
}

interface MenuStockManagementScreenProps {
  onAddNewItem?: () => void;
  onToggleStock?: (id: string, inStock: boolean) => void;
}

const INITIAL_ITEMS: StockItem[] = [
  {
    id: 'biryani',
    name: 'Chicken Dum Biryani',
    price: 140,
    note: '14 portions remaining',
    inStock: true,
    image: '/images/biryani.jpg'
  },
  {
    id: 'samosa',
    name: 'Crispy Veg Samosa (2 pcs)',
    price: 15,
    note: '32 pieces fresh ready',
    inStock: true,
    image: '/images/samosa.jpg'
  },
  {
    id: 'chai',
    name: 'Ginger Masala Chai',
    price: 12,
    note: '🔴 SOLD OUT • Next pot at 4:30 PM',
    inStock: false,
    emoji: '☕'
  },
  {
    id: 'lays',
    name: "Lay's Classic Salted",
    price: 20,
    note: '8 packets on shelf',
    inStock: true,
    image: '/images/lays_packet.jpg'
  }
];

/**
 * Screen 11 — "Menu & Live Stock Management", 1:1 from
 * figma_svgs/11_menu_stock_management.svg (375 × 812):
 *   - Header ........ (20,36): "Live Menu & Stock" 20 w800; "MITS Main Canteen • Vendor
 *                     Terminal" 11 w600; ONLINE pill 105×28 rx=12 #0A461E at (250,42)
 *                     with dot r5 #10B981 + text 10 w800
 *   - Stats strip ... (20,105): 3 × 105×60 rx=14 #EFF5EF stroke #C8D8CE soft; ACTIVE 18,
 *                     SOLD OUT 3 (#F26A00), TODAY ₹12,450 (#0A461E); labels 10 w700,
 *                     values 20/20/16 w800, inset x=12
 *   - Category pills (20,180): All (21) 70×30 #09431B active; Meals (8) 90×30,
 *                     Snacks (9) 95×30, Chai 56×30 #EFF5EF stroke #CAD8D0; text 11
 *   - Items ......... 335×96 rx=16 cards at y=225/335/445/555: thumb 68×68 rx=12,
 *                     name 14 w800 (x=94,y=32), price 13 w800 (y=52), note 10 w600 (y=70);
 *                     toggle 50×28 rx=14 knob d=22 (ON #09431B right, OFF #BAC8C0 left);
 *                     sold-out card opacity .85 + #B4C7BC thumb
 *   - FAB ........... (210,680) 145×48 rx=12 orange gradient "+ Add New Dish" 13 w800
 */
export const MenuStockManagementScreen: React.FC<MenuStockManagementScreenProps> = ({
  onAddNewItem,
  onToggleStock
}) => {
  const [items, setItems] = useState<StockItem[]>(INITIAL_ITEMS);
  const [category, setCategory] = useState<'all' | 'meals' | 'snacks' | 'chai'>('all');

  const activeCount = items.filter(i => i.inStock).length;
  const soldOutCount = items.length - activeCount;

  const toggle = (id: string) => {
    setItems(prev =>
      prev.map(i => {
        if (i.id !== id) return i;
        const inStock = !i.inStock;
        onToggleStock?.(id, inStock);
        return {
          ...i,
          inStock,
          note: inStock
            ? i.note.replace('🔴 SOLD OUT • Next pot at 4:30 PM', 'Back in stock — fresh pot ready')
            : '🔴 SOLD OUT • Next pot at 4:30 PM'
        };
      })
    );
  };

  const visible = items.filter(() => category === 'all');

  return (
    <div className="relative w-full max-w-[390px] mx-auto bg-[#E8ECEF] h-[812px] select-none overflow-hidden shadow-2xl rounded-[36px] border border-[#D6DCE2] font-sans">
      {/* Header — (20,36) */}
      <div className="absolute left-[20px] top-[36px]">
        <h1 className="text-[20px] font-extrabold text-[#0A2E20] leading-[24px]">
          Live Menu &amp; Stock
        </h1>
        <p className="mt-[4px] text-[11px] font-semibold text-[#5C7A6D]">
          MITS Main Canteen • Vendor Terminal
        </p>
      </div>
      {/* ONLINE pill — (250,42) 105×28 rx=12 */}
      <div
        className="absolute left-[250px] top-[42px] w-[105px] h-[28px] rounded-[12px] bg-[#0A461E] flex items-center pl-[11px] gap-[30px]"
        style={{ boxShadow: '-3px -3px 7px rgba(255,255,255,0.8), 4px 4px 8px rgba(163,174,187,0.4)' }}
      >
        <span className="w-[10px] h-[10px] rounded-full bg-[#10B981] animate-pulse shrink-0" />
        <span className="text-[10px] font-extrabold text-white">ONLINE</span>
      </div>

      {/* Stats strip — (20,105) */}
      <div className="absolute left-[20px] top-[105px] flex gap-[10px]">
        <div
          className="w-[105px] h-[60px] rounded-[14px] bg-[#E8ECEF] border border-[#D6DCE2] px-[12px] py-[10px]"
          style={{ boxShadow: '-6px -6px 12px rgba(255,255,255,0.85), 6px 6px 12px rgba(163,174,187,0.45)' }}
        >
          <p className="text-[10px] font-bold text-[#5C7A6D]">ACTIVE</p>
          <p className="mt-[6px] text-[20px] font-extrabold text-[#0A2E20] leading-[20px]">
            {activeCount}
          </p>
        </div>
        <div
          className="w-[105px] h-[60px] rounded-[14px] bg-[#E8ECEF] border border-[#D6DCE2] px-[12px] py-[10px]"
          style={{ boxShadow: '-6px -6px 12px rgba(255,255,255,0.85), 6px 6px 12px rgba(163,174,187,0.45)' }}
        >
          <p className="text-[10px] font-bold text-[#F26A00]">SOLD OUT</p>
          <p className="mt-[6px] text-[20px] font-extrabold text-[#F26A00] leading-[20px]">
            {soldOutCount}
          </p>
        </div>
        <div
          className="w-[105px] h-[60px] rounded-[14px] bg-[#E8ECEF] border border-[#D6DCE2] px-[12px] py-[10px]"
          style={{ boxShadow: '-6px -6px 12px rgba(255,255,255,0.85), 6px 6px 12px rgba(163,174,187,0.45)' }}
        >
          <p className="text-[10px] font-bold text-[#0A461E]">TODAY</p>
          <p className="mt-[8px] text-[16px] font-extrabold text-[#0A461E] leading-[16px]">
            ₹12,450
          </p>
        </div>
      </div>

      {/* Category pills — (20,180) */}
      <div className="absolute left-[20px] top-[180px] flex gap-[8px]">
        {([
          { key: 'all', label: `All (${items.length})`, w: 70 },
          { key: 'meals', label: 'Meals (8)', w: 90 },
          { key: 'snacks', label: 'Snacks (9)', w: 95 },
          { key: 'chai', label: 'Chai', w: 56 }
        ] as const).map(c => {
          const active = category === c.key;
          return (
            <button
              key={c.key}
              type="button"
              onClick={() => setCategory(c.key)}
              aria-pressed={active}
              className={`h-[30px] rounded-[12px] text-[11px] cursor-pointer transition-colors ${
                active
                  ? 'bg-[#09431B] font-extrabold text-white'
                  : 'bg-[#E8ECEF] border border-[#D6DCE2] font-bold text-[#0A2E20]'
              }`}
              style={{ width: c.w }}
            >
              {c.label}
            </button>
          );
        })}
      </div>

      {/* Item cards — y = 225/335/445/555, 335×96 rx=16 */}
      <div className="absolute left-[20px] top-[225px] space-y-[14px] w-[335px]">
        {visible.map(item => (
          <div
            key={item.id}
            className="w-[335px] h-[96px] rounded-[16px] bg-[#E8ECEF] border border-[#D6DCE2] relative"
            style={{ boxShadow: '-6px -6px 12px rgba(255,255,255,0.85), 6px 6px 12px rgba(163,174,187,0.45)', opacity: item.inStock ? 1 : 0.85 }}
          >
            {/* Thumb — (14,14) 68×68 rx=12 */}
            <div className="absolute left-[14px] top-[14px] w-[68px] h-[68px] rounded-[12px] overflow-hidden bg-[#0A2E20] flex items-center justify-center">
              {item.inStock && item.image ? (
                <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
              ) : (
                <span className="text-[24px]">{item.emoji ?? '🍽️'}</span>
              )}
            </div>

            <p className="absolute left-[94px] top-[21px] text-[14px] font-extrabold text-[#0A2E20] truncate w-[160px]">
              {item.name}
            </p>
            <p
              className="absolute left-[94px] top-[41px] text-[13px] font-extrabold leading-[16px]"
              style={{ color: item.inStock ? '#0A461E' : '#5C7A6D' }}
            >
              ₹{item.price}
            </p>
            <p
              className="absolute left-[94px] top-[59px] text-[10px] leading-[13px] w-[170px]"
              style={{ fontWeight: item.inStock ? 600 : 700, color: item.inStock ? '#5C7A6D' : '#EF4444' }}
            >
              {item.note}
            </p>

            {/* Toggle — (270,32) 50×28 rx=14 */}
            <button
              type="button"
              role="switch"
              aria-checked={item.inStock}
              aria-label={`Toggle ${item.name}`}
              onClick={() => toggle(item.id)}
              className="absolute left-[270px] top-[32px] w-[50px] h-[28px] rounded-[14px] cursor-pointer transition-colors"
              style={{
                background: item.inStock ? '#09431B' : '#C9D0D8',
                boxShadow: '-3px -3px 7px rgba(255,255,255,0.8), 4px 4px 8px rgba(163,174,187,0.4)'
              }}
            >
              <span
                className="absolute top-[3px] w-[22px] h-[22px] rounded-full bg-white transition-all"
                style={{ left: item.inStock ? 25 : 3 }}
              />
            </button>
          </div>
        ))}
      </div>

      {/* FAB — (210,680) 145×48 rx=12 orange gradient */}
      <button
        type="button"
        onClick={onAddNewItem}
        className="absolute left-[210px] top-[680px] w-[145px] h-[48px] rounded-[12px] text-white text-[13px] font-extrabold flex items-center justify-center gap-[4px] cursor-pointer hover:brightness-105 active:scale-[0.98] transition-all"
        style={{
          background: 'linear-gradient(180deg, #FF8A2A 0%, #F26A00 100%)',
          boxShadow: '-3px -3px 7px rgba(255,255,255,0.8), 4px 4px 9px rgba(199,123,58,0.4)'
        }}
      >
        <Plus className="w-[14px] h-[14px]" strokeWidth={2.6} />
        <span>Add New Dish</span>
      </button>
    </div>
  );
};
