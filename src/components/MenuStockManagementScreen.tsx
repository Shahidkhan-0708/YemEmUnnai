import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, Plus, RefreshCw } from 'lucide-react';
import { fetchVendorItems, setItemStock, setVendorAllStock, subscribeCatalogUpdates } from '../lib/api';
import { useVendorSession } from '../lib/hooks';
import type { FoodItem } from '../lib/types';

interface MenuStockManagementScreenProps {
  onBack?: () => void;
  onAddNewItem?: () => void;
  onToggleStock?: (id: string, inStock: boolean) => void;
}

export function MenuStockManagementScreen({ onBack, onAddNewItem, onToggleStock }: MenuStockManagementScreenProps) {
  const { vendor, checking } = useVendorSession();
  const vendorId = vendor?.vendorId;
  const [items, setItems] = useState<FoodItem[]>([]);
  const [category, setCategory] = useState<'all' | 'snacks' | 'chai'>('all');
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reload, setReload] = useState(0);
  const lock = useRef(false);

  useEffect(() => {
    let cancelled = false;
    let request = 0;
    setItems([]);
    setError(null);
    if (!vendorId) { setLoading(false); return; }
    const load = async () => {
      const current = ++request;
      setLoading(true);
      try {
        const data = await fetchVendorItems(vendorId);
        if (!cancelled && current === request) { setItems(data); setError(null); }
      } catch {
        if (!cancelled && current === request) setError('Unable to load your menu. Please try again.');
      } finally {
        if (!cancelled && current === request) setLoading(false);
      }
    };
    void load();
    const unsubscribe = subscribeCatalogUpdates(() => { void load(); });
    return () => { cancelled = true; unsubscribe(); };
  }, [vendorId, reload]);

  const saveStock = async (inStock: boolean, itemId?: string) => {
    if (!vendor || lock.current) return;
    lock.current = true;
    setBusy(true);
    setError(null);
    const previous = items;
    setItems(current => current.map(item => !itemId || item.id === itemId ? { ...item, inStock } : item));
    try {
      if (itemId) { await setItemStock(itemId, inStock); onToggleStock?.(itemId, inStock); }
      else await setVendorAllStock(vendor.vendorId, inStock);
    } catch {
      setItems(previous);
      setError('Could not save stock. Please try again.');
    } finally { lock.current = false; setBusy(false); }
  };

  const active = items.filter(item => item.inStock).length;
  const visible = items.filter(item => category === 'all' || (category === 'chai') === /tea|coffee|milk/i.test(item.name));

  return (
    <section className="mx-auto min-h-dvh w-full max-w-3xl bg-[#E8ECEF] px-5 py-6 text-[#0A2E20]">
      <button type="button" onClick={onBack} className="mb-4 flex min-h-11 items-center gap-2 text-sm font-bold">
        <ArrowLeft className="size-4" />Back to Dashboard
      </button>
      {!vendor || checking ? <p role="status">{checking ? 'Checking your session…' : 'Sign in to manage your cafe’s menu.'}</p> : <>
        <header className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0"><h1 className="text-xl font-extrabold">Live Menu &amp; Stock</h1><p className="mt-1 break-words text-sm text-[#5C7A6D]">{vendor.vendorName} · Vendor Terminal</p></div>
          <span className="rounded-full bg-[#09431B] px-3 py-2 text-xs font-bold text-white">{vendor.isOnline ? 'ONLINE' : 'OFFLINE'}</span>
        </header>
        <div className="mt-6 grid grid-cols-2 gap-3">
          <div className="rounded-2xl tactile-card p-4"><p className="text-xs font-bold text-[#5C7A6D]">ACTIVE</p><p className="mt-2 text-2xl font-extrabold">{active}</p></div>
          <div className="rounded-2xl tactile-card p-4"><p className="text-xs font-bold text-[#5C7A6D]">SOLD OUT</p><p className="mt-2 text-2xl font-extrabold text-[#F26A00]">{items.length - active}</p></div>
        </div>
        <div className="mt-6 flex flex-wrap gap-2" aria-label="Menu categories">
          {(['all', 'snacks', 'chai'] as const).map(value => <button type="button" key={value} aria-pressed={category === value} onClick={() => setCategory(value)}
            className={`min-h-11 rounded-xl px-4 text-sm font-bold ${category === value ? 'bg-[#09431B] text-white' : 'tactile-inset'}`}>
            {value === 'all' ? `All (${items.length})` : value === 'snacks' ? 'Snacks' : 'Chai'}
          </button>)}
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          <button type="button" disabled={busy || loading || !items.length} onClick={() => void saveStock(false)} className="min-h-11 rounded-xl border border-red-200 px-3 text-sm font-bold text-red-700 disabled:opacity-50">All Sold Out</button>
          <button type="button" disabled={busy || loading || !items.length} onClick={() => void saveStock(true)} className="min-h-11 rounded-xl border border-[#BACBC1] px-3 text-sm font-bold disabled:opacity-50">All Live</button>
          <button type="button" disabled={busy} onClick={() => setReload(value => value + 1)} aria-label="Refresh menu" className="flex min-h-11 items-center gap-2 rounded-xl px-3 text-sm font-bold"><RefreshCw className="size-4" />Refresh</button>
        </div>
        {error && <p role="alert" className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}
        {loading ? <p role="status" className="py-8 text-sm text-[#5C7A6D]">Loading your menu…</p> :
          <div className="mt-5 space-y-3">
            {!visible.length && <p className="py-8 text-sm text-[#5C7A6D]">{items.length ? 'No items in this category.' : 'No dishes yet. Add your first dish below.'}</p>}
            {visible.map(item => <article key={item.id} className="flex items-center gap-3 rounded-2xl tactile-card p-3">
              <img src={item.image} alt="" className="size-16 shrink-0 rounded-xl object-cover" />
              <div className="min-w-0 flex-1"><h2 className="break-words text-sm font-extrabold">{item.name}</h2><p className="mt-1 font-bold">₹{item.price}</p><p className="mt-1 text-xs text-[#5C7A6D]">{item.inStock ? 'In stock' : 'Sold out'}</p></div>
              <button type="button" role="switch" aria-checked={item.inStock} aria-label={`Stock for ${item.name}`} disabled={busy}
                onClick={() => void saveStock(!item.inStock, item.id)} className="flex min-h-11 shrink-0 items-center justify-center disabled:opacity-50">
                <span className={`relative h-7 w-12 rounded-full ${item.inStock ? 'bg-[#09431B]' : 'bg-[#A3AEBB]'}`}><span className={`absolute left-1 top-1 size-5 rounded-full bg-white transition-transform ${item.inStock ? 'translate-x-5' : ''}`} /></span>
              </button>
            </article>)}
          </div>}
        <button type="button" onClick={onAddNewItem} className="mt-6 flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#F26A00] px-4 py-3 text-sm font-extrabold text-white"><Plus className="size-5" />Add New Dish</button>
      </>}
    </section>
  );
}
