import React, { useState, useEffect } from 'react';
import { Plus, CheckCircle2, XCircle } from 'lucide-react';
import { fetchVendorItems, setItemStock, setVendorAllStock } from '../lib/api';
import type { FoodItem } from '../lib/types';

interface MenuStockManagementScreenProps {
  vendorId?: string;
  onAddNewItem?: () => void;
  onToggleStock?: (id: string, inStock: boolean) => void;
}

export const MenuStockManagementScreen: React.FC<MenuStockManagementScreenProps> = ({
  vendorId = 'a0000000-0000-4000-8000-000000000001',
  onAddNewItem,
  onToggleStock
}) => {
  const [items, setItems] = useState<FoodItem[]>([]);
  const [category, setCategory] = useState<'all' | 'snacks' | 'chai'>('all');

  const loadMenu = async () => {
    const data = await fetchVendorItems(vendorId);
    setItems(data);
  };

  useEffect(() => {
    loadMenu();
  }, [vendorId]);

  const activeCount = items.filter(i => i.inStock).length;
  const soldOutCount = items.length - activeCount;

  const toggle = async (id: string) => {
    const target = items.find(i => i.id === id);
    if (!target) return;
    const nextStock = !target.inStock;

    // Optimistic UI update
    setItems(prev => prev.map(i => i.id === id ? { ...i, inStock: nextStock } : i));
    
    // Persist to store & Supabase
    await setItemStock(id, nextStock);
    onToggleStock?.(id, nextStock);
  };

  const handleBulkStock = async (inStock: boolean) => {
    setItems(prev => prev.map(i => ({ ...i, inStock })));
    await setVendorAllStock(vendorId, inStock);
  };

  const visible = items.filter(item => {
    if (category === 'all') return true;
    if (category === 'chai') return /tea|coffee|milk/i.test(item.name);
    if (category === 'snacks') return !/tea|coffee|milk/i.test(item.name);
    return true;
  });

  return (
    <div className="relative w-full max-w-97.5 mx-auto bg-[#E8ECEF] h-203 select-none overflow-hidden shadow-2xl rounded-[36px] border border-[#D6DCE2] font-sans">
      {/* Header — (20,36) */}
      <div className="absolute left-5 top-9">
        <h1 className="text-[20px] font-extrabold text-[#0A2E20] leading-6">
          Live Menu &amp; Stock
        </h1>
        <p className="mt-1 text-[11px] font-semibold text-[#5C7A6D]">
          MITS Canteen • Vendor Terminal
        </p>
      </div>
      {/* ONLINE pill — (250,42) 105×28 rx=12 */}
      <div
        className="absolute left-62.5 top-10.5 w-26.25 h-7 rounded-xl bg-[#0A461E] flex items-center pl-2.75 gap-7.5"
        style={{ boxShadow: '-3px -3px 7px rgba(255,255,255,0.8), 4px 4px 8px rgba(163,174,187,0.4)' }}
      >
        <span className="w-2.5 h-2.5 rounded-full bg-[#10B981] animate-pulse shrink-0" />
        <span className="text-[10px] font-extrabold text-white">ONLINE</span>
      </div>

      {/* Stats strip — (20,105) */}
      <div className="absolute left-5 top-26.25 flex gap-2.5">
        <div
          className="w-26.25 h-15 rounded-[14px] bg-[#E8ECEF] border border-[#D6DCE2] px-3 py-2.5"
          style={{ boxShadow: '-6px -6px 12px rgba(255,255,255,0.85), 6px 6px 12px rgba(163,174,187,0.45)' }}
        >
          <p className="text-[10px] font-bold text-[#5C7A6D]">ACTIVE</p>
          <p className="mt-1.5 text-[20px] font-extrabold text-[#0A2E20] leading-5">
            {activeCount}
          </p>
        </div>
        <div
          className="w-26.25 h-15 rounded-[14px] bg-[#E8ECEF] border border-[#D6DCE2] px-3 py-2.5"
          style={{ boxShadow: '-6px -6px 12px rgba(255,255,255,0.85), 6px 6px 12px rgba(163,174,187,0.45)' }}
        >
          <p className="text-[10px] font-bold text-[#F26A00]">SOLD OUT</p>
          <p className="mt-1.5 text-[20px] font-extrabold text-[#F26A00] leading-5">
            {soldOutCount}
          </p>
        </div>
        <div
          className="w-26.25 h-15 rounded-[14px] bg-[#E8ECEF] border border-[#D6DCE2] px-3 py-2.5"
          style={{ boxShadow: '-6px -6px 12px rgba(255,255,255,0.85), 6px 6px 12px rgba(163,174,187,0.45)' }}
        >
          <p className="text-[10px] font-bold text-[#0A461E]">TODAY</p>
          <p className="mt-2 text-[16px] font-extrabold text-[#0A461E] leading-4">
            ₹12,450
          </p>
        </div>
      </div>

      {/* Category pills & Quick Bulk Controls — (20,175) */}
      <div className="absolute left-5 top-43.75 right-5 flex items-center justify-between">
        <div className="flex gap-1.5">
          {([
            { key: 'all' as const, label: `All (${items.length})` },
            { key: 'snacks' as const, label: 'Snacks' },
            { key: 'chai' as const, label: 'Chai' }
          ]).map(c => {
            const active = category === c.key;
            return (
              <button
                key={c.key}
                type="button"
                onClick={() => setCategory(c.key)}
                aria-pressed={active}
                className={`h-7 px-2.5 rounded-[10px] text-[10px] cursor-pointer transition-colors ${
                  active
                    ? 'bg-[#09431B] font-extrabold text-white'
                    : 'bg-[#E8ECEF] border border-[#D6DCE2] font-bold text-[#0A2E20]'
                }`}
              >
                {c.label}
              </button>
            );
          })}
        </div>

        {/* Master Bulk Stock Controls */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => handleBulkStock(false)}
            className="px-2 py-1 rounded-lg bg-red-500/10 border border-red-500/30 text-red-700 text-[9.5px] font-extrabold cursor-pointer hover:bg-red-500/20 active:scale-95 transition-all flex items-center gap-1"
            title="Mark all items as sold out"
          >
            <XCircle className="w-3 h-3 text-red-600" />
            <span>All Sold Out</span>
          </button>
          <button
            type="button"
            onClick={() => handleBulkStock(true)}
            className="px-2 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-800 text-[9.5px] font-extrabold cursor-pointer hover:bg-emerald-500/20 active:scale-95 transition-all flex items-center gap-1"
            title="Mark all items as live"
          >
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            <span>All Live</span>
          </button>
        </div>
      </div>

      {/* Item cards — Scrollable list */}
      <div className="absolute left-5 top-53.75 bottom-21 space-y-3 w-83.75 overflow-y-auto no-scrollbar pr-0.5 pb-2">
        {visible.map(item => (
          <div
            key={item.id}
            className="w-83.75 h-24 rounded-2xl bg-[#E8ECEF] border border-[#D6DCE2] relative"
            style={{ boxShadow: '-6px -6px 12px rgba(255,255,255,0.85), 6px 6px 12px rgba(163,174,187,0.45)', opacity: item.inStock ? 1 : 0.85 }}
          >
            {/* Thumb — (14,14) 68×68 rx=12 */}
            <div className="absolute left-3.5 top-3.5 w-17 h-17 rounded-xl overflow-hidden bg-[#0A2E20] flex items-center justify-center">
              {item.image ? (
                <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
              ) : (
                <span className="text-[24px]">🍽️</span>
              )}
            </div>

            <p className="absolute left-23.5 top-5.25 text-[14px] font-extrabold text-[#0A2E20] truncate w-40">
              {item.name}
            </p>
            <p
              className="absolute left-23.5 top-10.25 text-[13px] font-extrabold leading-4"
              style={{ color: item.inStock ? '#0A461E' : '#5C7A6D' }}
            >
              ₹{item.price}
            </p>
            <p
              className="absolute left-23.5 top-14.75 text-[10px] leading-3.25 w-42.5"
              style={{ fontWeight: item.inStock ? 600 : 700, color: item.inStock ? '#5C7A6D' : '#EF4444' }}
            >
              {item.inStock ? (item.freshnessTag ?? 'Ready in kitchen • In stock') : '🔴 SOLD OUT • Back soon'}
            </p>

            {/* Toggle — (270,32) 50×28 rx=14 */}
            <button
              type="button"
              role="switch"
              aria-checked={item.inStock}
              aria-label={`Toggle ${item.name}`}
              onClick={() => toggle(item.id)}
              className="absolute left-67.5 top-8 w-12.5 h-7 rounded-[14px] cursor-pointer transition-colors"
              style={{
                background: item.inStock ? '#09431B' : '#C9D0D8',
                boxShadow: '-3px -3px 7px rgba(255,255,255,0.8), 4px 4px 8px rgba(163,174,187,0.4)'
              }}
            >
              <span
                className="absolute top-0.75 w-5.5 h-5.5 rounded-full bg-white transition-all"
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
        className="absolute left-52.5 top-170 w-36.25 h-12 rounded-xl text-white text-[13px] font-extrabold flex items-center justify-center gap-1 cursor-pointer hover:brightness-105 active:scale-[0.98] transition-all"
        style={{
          background: 'linear-gradient(180deg, #FF8A2A 0%, #F26A00 100%)',
          boxShadow: '-3px -3px 7px rgba(255,255,255,0.8), 4px 4px 9px rgba(199,123,58,0.4)'
        }}
      >
        <Plus className="w-3.5 h-3.5" strokeWidth={2.6} />
        <span>Add New Dish</span>
      </button>
    </div>
  );
};
