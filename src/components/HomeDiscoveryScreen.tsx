import { useState } from 'react';
import { Search, ThumbsUp, MessageSquare, MapPin, ArrowUpRight, X, Flame, Package, Utensils } from 'lucide-react';
import { useFoodItems, useShops, useReactions } from '../lib/hooks';
import { cleanShopTag } from '../lib/api';
import type { FoodItem } from '../lib/types';
export type { FoodItem } from '../lib/types';

interface HomeDiscoveryScreenProps {
  cartCount?: number; onOrderNow?: (item: FoodItem) => void; onWalkIn?: (item: FoodItem) => void;
  onReview?: (item: FoodItem) => void; onCartClick?: () => void; onSelectShop?: (name: string) => void;
  onVendorLogin?: () => void; onSelectItem?: (item: FoodItem) => void; onBusinessPortal?: () => void;
}
const filters = [ { id: 'all', label: 'All', icon: Utensils }, { id: 'cooked', label: 'Cooked', icon: Flame }, { id: 'packed', label: 'Packed', icon: Package }, { id: 'deals', label: 'Hot deals', icon: Flame } ] as const;
export function HomeDiscoveryScreen({ onOrderNow, onWalkIn, onReview, onSelectShop, onSelectItem, onBusinessPortal }: HomeDiscoveryScreenProps) {
  const [filter, setFilter] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [shop, setShop] = useState('All');
  const shops = useShops();
  const { items, loading, error, retry } = useFoodItems();
  const { myReactions, counts, toggleLike } = useReactions(items);
  const activeShops = shops.filter(s => s.isActive !== false);
  const visible = items.filter(item => {
    const online = shops.find(s => s.id === item.vendorId)?.isOnline ?? item.isShopOnline;
    return (shop === 'All' ? online !== false : item.vendor === shop)
      && (filter === 'all' || item.category === filter || (filter === 'deals' && item.originalPrice != null && item.originalPrice > item.price))
      && `${item.name} ${item.vendor}`.toLowerCase().includes(search.trim().toLowerCase());
  });
  const selectShop = (name: string) => { setShop(name); onSelectShop?.(name); };
  return (
    <div className="consumer-ui discovery-screen">
      <header className="discovery-header">
        <div className="brand-row"><div className="brand-lockup"><img src="/images/brand_logo_full.png" width="44" height="44" alt="" /><span>YEMUNNAI</span></div><span className="campus-badge status-live">{`${activeShops.filter(s => s.isOnline).length} ${activeShops.filter(s => s.isOnline).length === 1 ? 'shop' : 'shops'} open`}</span></div>
        <p className="campus-eyebrow campus-location">MITS campus · made for your break</p>
        <h1>Good food.<br /><span>Between lectures.</span></h1>
        <p className="campus-muted hero-copy">Find your next bite. Send an order or head to the counter.</p>
        <form className="campus-search" role="search" onSubmit={e => e.preventDefault()}>
          <Search size={20} aria-hidden="true" /><label className="sr-only" htmlFor="campus-search">Search food or shops</label>
          <input id="campus-search" type="search" name="search" placeholder="Tea, samosa, coffee…" value={search} onChange={e => setSearch(e.target.value)} />
          {search && <button type="button" className="campus-icon" aria-label="Clear search" onClick={() => setSearch('')}><X size={18} aria-hidden="true" /></button>}
        </form>
      </header>
      <section className="shops-section" aria-labelledby="shops-heading">
        <div className="section-row"><h2 id="shops-heading">Around campus</h2><button className="campus-text-button" onClick={() => selectShop('All')}>Show all shops <ArrowUpRight size={16} aria-hidden="true" /></button></div>
        <div className="shop-carousel" aria-label="Filter by shop">
          {activeShops.map(s => <button key={s.id} className="shop-choice" aria-pressed={shop === s.name} onClick={() => selectShop(shop === s.name ? 'All' : s.name)}>
            <img src={s.image} width="64" height="64" alt="" loading="lazy" />
            <strong>{s.name}</strong><span className={s.isOnline ? 'shop-open' : 'shop-closed'}>{s.isOnline ? cleanShopTag(s.tag) : 'Closed'}</span>
          </button>)}
        </div>
      </section>
      <nav className="food-filters" aria-label="Food categories">{filters.map(({ id, label, icon: Icon }) => <button key={id} aria-pressed={filter === id} onClick={() => setFilter(id)}><Icon size={16} aria-hidden="true" />{label}</button>)}</nav>
      <section className="menu-section" aria-labelledby="menu-heading" aria-busy={loading}>
        <div className="section-row"><div><p className="campus-eyebrow">{shop === 'All' ? 'The campus menu' : shop}</p><h2 id="menu-heading">{filter === 'deals' ? 'A little less. Just as good.' : 'What sounds good?'}</h2></div><span className="menu-count">{visible.length} items</span></div>
        <p role="status" className="sr-only">{loading ? 'Refreshing the menu' : `${visible.length} items shown`}</p>
        {error && <div className="campus-error"><p role="alert">{error}</p><button className="campus-text-button" onClick={retry}>Retry menu</button></div>}
        {loading && items.length === 0 && <div className="food-grid" aria-hidden="true">{[0,1,2,3].map(id => <div key={id} className="food-skeleton campus-surface"><div className="food-photo" /><div className="skeleton-lines" /></div>)}</div>}
        {shop !== 'All' && shops.find(s => s.name === shop)?.isOnline === false && <p className="campus-error">{shop} is closed. Browse the menu or choose another shop.</p>}
        <div className="food-grid">{visible.map(item => {
          const online = shops.find(s => s.id === item.vendorId)?.isOnline ?? item.isShopOnline;
          const available = !error && item.inStock && online !== false && item.price > 0;
          const current = { ...item, isShopOnline: online };
          return <article key={item.id} className="food-card campus-surface">
            <button className="food-photo" aria-label={`View ${item.name} details`} onClick={() => onSelectItem?.(current)}>
              <img src={item.image} width="480" height="360" alt="" loading="lazy" decoding="async" />
              <span className={`campus-badge photo-status ${available ? 'status-live' : 'status-closed'}`}>{!item.inStock ? 'Sold out' : online === false ? 'Closed' : item.price <= 0 ? 'Price pending' : 'In stock'}</span>
            </button>
            <div className="food-card-body"><div className="food-meta"><span>{item.isVeg === undefined ? item.category : item.isVeg ? 'Veg' : 'Non-veg'}</span>{item.stockLeft != null && <span className="stock-count">{item.stockLeft} left</span>}</div>
              <h3><button onClick={() => onSelectItem?.(current)}>{item.name}</button></h3>
              <p className="food-vendor">{item.vendor}</p><p className="food-location"><MapPin size={12} aria-hidden="true" />{item.walkTime || item.locationLandmark || 'MITS campus'}</p>
              <div className="food-price"><strong>{item.price > 0 ? `₹${item.price}` : 'Price pending'}</strong>{item.originalPrice != null && item.originalPrice > item.price && <s>₹{item.originalPrice}</s>}</div>
              <div className="food-reactions"><button aria-label={`Like ${item.name}`} aria-pressed={myReactions[item.id] === 'like'} onClick={() => toggleLike(item.id)}><ThumbsUp size={15} aria-hidden="true" /><span>{counts[item.id]?.likes ?? item.likes}</span></button><button aria-label={`Review ${item.name}`} onClick={() => onReview?.(current)}><MessageSquare size={15} aria-hidden="true" /><span>{item.reviews}</span></button></div>
              <button className="campus-card-action" disabled={!available} onClick={() => item.actionType === 'walkin' ? onWalkIn?.(current) : onOrderNow?.(current)}>{!available ? (error ? 'Menu offline' : !item.inStock ? 'Sold out' : online === false ? 'Shop closed' : 'Price pending') : item.actionType === 'walkin' ? 'Find shop' : 'Quick order'}<ArrowUpRight size={16} aria-hidden="true" /></button>
            </div>
          </article>;
        })}</div>
        {!loading && !error && visible.length === 0 && <div className="menu-empty campus-surface"><h3>{search ? `No matches for “${search}”` : filter === 'deals' ? 'No deals listed right now' : 'No items in this view'}</h3><p className="campus-muted">Try the full menu to find your next bite.</p><button className="campus-primary" onClick={() => { setSearch(''); setFilter('all'); selectShop('All'); }}>Show the full menu</button></div>}
      </section>
      <footer className="consumer-footer"><span>For the MITS lunch break.</span><button className="campus-text-button" onClick={onBusinessPortal}>Open business portal <ArrowUpRight size={14} aria-hidden="true" /></button></footer>
    </div>
  );
}
