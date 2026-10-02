import { useState } from 'react';
import { ChevronLeft, MapPin, Minus, Plus } from 'lucide-react';
import type { FoodItem } from '../lib/types';

interface FoodItemDetailScreenProps {
  item: FoodItem | null;
  onBack?: () => void;
  onMap?: () => void;
  onOrder?: (qty: number) => void;
}

export function FoodItemDetailScreen({ item, onBack, onMap, onOrder }: FoodItemDetailScreenProps) {
  const [qty, setQty] = useState(1);
  if (!item) return null;
  const available = item.inStock && item.isShopOnline !== false && item.price > 0;
  const status = !item.inStock ? 'Sold out' : item.isShopOnline === false ? 'Shop closed' : 'In stock';
  return (
    <div className="consumer-ui detail-screen">
      <header className="detail-nav">
        <button className="campus-icon" onClick={onBack} aria-label="Back to menu"><ChevronLeft aria-hidden="true" /></button>
        <span className="campus-eyebrow">On the menu</span>
        <span className="campus-badge">{item.isVeg === undefined ? item.category : item.isVeg ? 'Veg' : 'Non-veg'}</span>
      </header>
      <div className="detail-photo">
        <img src={item.image} alt={item.name} width="640" height="480" fetchPriority="high" />
        <span className={`campus-badge photo-status ${available ? 'status-live' : 'status-closed'}`}>{status}</span>
      </div>
      <section className="detail-body">
        <div className="detail-title"><h1>{item.name}</h1><strong className="campus-price">{item.price > 0 ? `₹${item.price}` : 'Price pending'}</strong></div>
        {item.originalPrice != null && item.originalPrice > item.price && <p className="campus-muted"><s>₹{item.originalPrice}</s> regular price</p>}
        <button className="campus-surface vendor-direction" onClick={onMap}>
          <span><strong>{item.vendor}</strong><span className="campus-muted">{item.locationLandmark || item.walkTime || 'MITS campus'}</span></span>
          <span className="direction-label"><MapPin size={18} aria-hidden="true" /> Find shop</span>
        </button>
        <div className="detail-tags">
          <span className={`campus-badge ${available ? 'status-live' : 'status-closed'}`}>{status}</span>
          <span className="campus-badge">{item.category === 'packed' ? 'Packed snack' : 'From the kitchen'}</span>
          {item.stockLeft != null && <span className="campus-badge status-warm">{item.stockLeft} left</span>}
        </div>
        <h2 className="campus-section-title">Before you order</h2>
        <p className="campus-muted">{item.actionType === 'walkin' ? 'Head to the shop and order at the counter.' : 'Send your order to the shop. Keep your token handy and check the live status for updates.'}</p>
      </section>
      <footer className="detail-actions">
        {item.actionType === 'order' && <div className="campus-stepper">
          <button aria-label="Decrease quantity" disabled={!available || qty <= 1} onClick={() => setQty(q => q - 1)}><Minus size={18} aria-hidden="true" /></button>
          <output aria-label="Quantity">{qty}</output>
          <button aria-label="Increase quantity" disabled={!available || qty >= 10} onClick={() => setQty(q => q + 1)}><Plus size={18} aria-hidden="true" /></button>
        </div>}
        <button className="campus-primary" disabled={!available} onClick={() => item.actionType === 'walkin' ? onMap?.() : onOrder?.(qty)}>
          {!available ? (item.price <= 0 ? 'Price pending' : status) : item.actionType === 'walkin' ? 'Find the shop' : `Order · ₹${item.price * qty}`}
        </button>
      </footer>
    </div>
  );
}
