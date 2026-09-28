import React, { useState } from 'react';
import { Search, ShoppingCart, ThumbsUp, ThumbsDown, MessageSquare, MapPin, ChevronRight, Sparkles, Flame, Clock, X, WifiOff } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Card, CardContent } from './ui/card';
import { Input } from './ui/input';
import { useFoodItems, useShops, useReactions } from '../lib/hooks';
import { isBackendConfigured } from '../lib/supabase';
import type { FoodCategory, FoodItem } from '../lib/types';

export type { FoodItem } from '../lib/types';

interface HomeDiscoveryScreenProps {
  cartCount?: number;
  onOrderNow?: (item: FoodItem) => void;
  onWalkIn?: (item: FoodItem) => void;
  onReview?: (item: FoodItem) => void;
  onCartClick?: () => void;
  onSelectShop?: (shopName: string) => void;
  onVendorLogin?: () => void;
  onSelectItem?: (item: FoodItem) => void;
}

export const HomeDiscoveryScreen: React.FC<HomeDiscoveryScreenProps> = ({
  cartCount = 0,
  onOrderNow,
  onWalkIn,
  onReview,
  onCartClick,
  onSelectShop,
  onSelectItem
}) => {
  const [selectedCategory, setSelectedCategory] = useState<FoodCategory>('cooked');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedShop, setSelectedShop] = useState<string>('All');

  const shops = useShops();
  const { items, loading } = useFoodItems(selectedCategory);
  const { myReactions, counts, toggleLike, toggleDislike } = useReactions(items);

  // Filter by query + shop, overlaying live reaction counts
  const displayedItems = items
    .filter(item => {
      const q = searchQuery.toLowerCase();
      const matchesQuery = item.name.toLowerCase().includes(q) ||
                           item.vendor.toLowerCase().includes(q);
      const matchesShop = selectedShop === 'All' || item.vendor.toLowerCase().includes(selectedShop.toLowerCase());
      return matchesQuery && matchesShop;
    })
    .map(item => {
      const c = counts[item.id];
      return c ? { ...item, likes: c.likes, dislikes: c.dislikes } : item;
    });

  return (
    <div className="w-full max-w-[390px] mx-auto bg-[#E8ECEF] min-h-[820px] pb-10 select-none overflow-hidden relative shadow-2xl rounded-[36px] border border-[#D6DCE2] font-sans">
      
      {/* TOP DEEP FOREST-GREEN HEADER WITH EXTENDED TOP BREATHING ROOM */}
      <div className="bg-gradient-to-b from-[#0A461E] via-[#09431B] to-[#063214] px-4 pt-7 pb-6 rounded-b-[30px] text-white shadow-lg">
        
        {/* Search Bar + Orange Circular Cart Button */}
        <div className="flex items-center gap-3">
          <div className="flex-1 relative flex items-center bg-[#E8ECEF]/95 backdrop-blur-xs border border-[#D6DCE2] rounded-full px-4 py-2 shadow-inner transition-all focus-within:ring-2 focus-within:ring-[#10B981] focus-within:bg-white">
            <Search className="w-4 h-4 text-[#527063] shrink-0 mr-2.5" />
            <Input
              type="text"
              placeholder="Search biryani, samosa, tuck shops..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-8 p-0 border-0 focus-visible:ring-0 text-xs"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="p-1 text-[#527063] hover:text-[#0A2E20]">
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Circular Orange Cart Button with Shadcn styling */}
          <Button
            onClick={onCartClick}
            variant="orange"
            size="icon"
            className="w-10 h-10 shrink-0 relative"
            aria-label="View Cart"
          >
            <ShoppingCart className="w-4.5 h-4.5 fill-white/10" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-white text-[#F26A00] text-[10px] font-extrabold w-4.5 h-4.5 rounded-full flex items-center justify-center shadow-md animate-in zoom-in-75">
                {cartCount}
              </span>
            )}
          </Button>
        </div>

        {/* Local Shops Section */}
        <div className="mt-4">
          <div 
            onClick={() => {
              setSelectedShop('All');
              onSelectShop?.('All Shops');
            }}
            className="flex items-center justify-between cursor-pointer group mb-2.5"
          >
            <div className="flex items-center gap-1.5">
              <span className="text-white text-[13.5px] font-bold tracking-wide">Local Canteens &amp; Shops</span>
              <Badge variant="live" className="text-[8px] py-0 px-1.5">LIVE RADAR</Badge>
            </div>
            <div className="flex items-center gap-1 text-[11px] text-[#A7F3D0] group-hover:text-white transition-colors">
              <span>{selectedShop === 'All' ? 'View All' : `Filter: ${selectedShop}`}</span>
              <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </div>

          {/* Horizontal Scrolling Shop Avatars */}
          <div className="flex items-start gap-3 overflow-x-auto no-scrollbar pt-1 pb-1 px-0.5">
            {shops.map((shop) => {
              const isSelected = selectedShop.toLowerCase() === shop.name.toLowerCase();
              return (
                <div 
                  key={shop.id} 
                  onClick={() => {
                    const next = isSelected ? 'All' : shop.name;
                    setSelectedShop(next);
                    onSelectShop?.(next);
                  }}
                  className="flex flex-col items-center gap-1 shrink-0 cursor-pointer group"
                >
                  <div className={`relative w-[54px] h-[54px] rounded-full p-0.5 transition-all duration-200 group-hover:scale-105 ${
                    isSelected ? 'ring-3 ring-[#F26A00] scale-105' : 'ring-2 ring-white/30'
                  }`}>
                    <img
                      src={shop.image}
                      alt={shop.name}
                      className="w-full h-full object-cover rounded-full"
                      loading="lazy"
                    />
                    {shop.isActive && (
                      <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-[#10B981] border-2 border-[#09431B] rounded-full animate-radar-ring" />
                    )}
                  </div>
                  <span className={`text-[10px] font-bold tracking-tight text-center whitespace-nowrap max-w-[64px] truncate ${
                    isSelected ? 'text-[#FF8A2A]' : 'text-white'
                  }`}>
                    {shop.name}
                  </span>
                  <span className="text-[8px] text-[#A7F3D0]/80 font-medium">
                    {shop.tag ?? ''}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* DEMO / LIVE backend banner */}
      {!isBackendConfigured && (
        <div className="mx-4 mt-3 flex items-center gap-2 bg-amber-50 border border-amber-200 text-amber-800 rounded-xl px-3 py-2 text-[10px] font-bold">
          <WifiOff className="w-3.5 h-3.5 shrink-0" />
          <span>Demo mode — add Supabase keys in .env.local to go live.</span>
        </div>
      )}

      {/* SEGMENTED CONTROL: COOKED FOODS / PACKED FOODS */}
      <div className="px-4 mt-3.5">
        <div className="flex items-center p-1 rounded-full bg-[#DDE2E8] border border-[#D6DCE2] shadow-inner">
          <button
            onClick={() => setSelectedCategory('cooked')}
            className={`flex-1 py-1.5 px-3 rounded-full text-xs font-bold transition-all text-center flex items-center justify-center gap-1.5 cursor-pointer ${
              selectedCategory === 'cooked'
                ? 'bg-[#09431B] text-white shadow-md'
                : 'text-[#09431B] hover:bg-black/5'
            }`}
          >
            <Flame className="w-3.5 h-3.5 text-amber-400" />
            <span>Cooked Foods ({items.filter(i => i.category === 'cooked').length})</span>
          </button>

          <button
            onClick={() => setSelectedCategory('packed')}
            className={`flex-1 py-1.5 px-3 rounded-full text-xs font-bold transition-all text-center flex items-center justify-center gap-1.5 cursor-pointer ${
              selectedCategory === 'packed'
                ? 'bg-[#09431B] text-white shadow-md'
                : 'text-[#09431B] hover:bg-black/5'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span>Packed Foods ({items.filter(i => i.category === 'packed').length})</span>
          </button>
        </div>
      </div>

      {/* 2-COLUMN FOOD GRID */}
      <div className="px-4 mt-3.5 grid grid-cols-2 gap-3">
        {loading && displayedItems.length === 0 && (
          <>
            {[0, 1, 2, 3].map(i => (
              <Card key={i} className="tactile-card rounded-[20px] p-2.5 animate-pulse">
                <div className="w-full aspect-[4/3] rounded-[14px] bg-[#DDE2E8]" />
                <div className="mt-2 px-1 space-y-1.5">
                  <div className="h-3 w-3/4 rounded bg-[#DDE2E8]" />
                  <div className="h-2.5 w-1/2 rounded bg-[#DDE2E8]" />
                  <div className="h-3 w-1/3 rounded bg-[#DDE2E8]" />
                </div>
              </Card>
            ))}
          </>
        )}

        {displayedItems.map((item) => {
          const isLiked = myReactions[item.id] === 'like';
          const isDisliked = myReactions[item.id] === 'dislike';

          return (
            <Card
              key={item.id}
              className="tactile-card rounded-[20px] p-2.5 flex flex-col justify-between"
            >
              {/* Real Food Photograph with Live Badges */}
              <div
                className="w-full aspect-[4/3] rounded-[14px] overflow-hidden bg-slate-100 relative shadow-xs cursor-pointer"
                onClick={() => onSelectItem?.(item)}
                role="button"
                aria-label={`View ${item.name} details`}
              >
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-full h-full object-cover object-center transition-transform hover:scale-105 duration-300"
                  loading="lazy"
                />

                {/* Bottom Scrim overlay for 100% text and badge readability */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent pointer-events-none" />

                {/* Freshness Badge overlay */}
                {item.freshnessTag && (
                  <div className="absolute top-1.5 left-1.5 bg-[#062E16]/95 backdrop-blur-xs text-white text-[8px] font-extrabold px-2 py-0.5 rounded-full flex items-center gap-1 border border-emerald-500/40 shadow-xs animate-scarcity">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span>{item.freshnessTag}</span>
                  </div>
                )}

                {/* Walking Time Pill overlay (high contrast on dark scrim) */}
                <div className="absolute bottom-1.5 right-1.5 bg-[#062E16]/90 backdrop-blur-xs text-[#A7F3D0] text-[8.5px] font-extrabold px-2 py-0.5 rounded-md flex items-center gap-1 shadow-xs border border-white/20">
                  <Clock className="w-2.5 h-2.5 text-emerald-400" />
                  <span>{item.walkTime}</span>
                </div>
              </div>

              {/* Title & Info */}
              <CardContent className="mt-2 px-1 p-0">
                <h3 className="text-[13px] font-extrabold text-[#0A2E20] leading-snug line-clamp-1">
                  {item.name}
                </h3>
                <p className="text-[10px] font-medium text-[#5C7A6D] mt-0.5 truncate flex items-center justify-between">
                  <span>{item.vendor}</span>
                  <span className="text-amber-600 font-bold">★ {item.rating}</span>
                </p>
                <div className="mt-1 flex items-baseline justify-between">
                  <div className="flex items-baseline gap-1.5">
                    <span className={`text-[15px] font-black ${
                      item.actionType === 'order' ? 'text-[#F26A00]' : 'text-[#09431B]'
                    }`}>
                      ₹{item.price}
                    </span>
                    {item.originalPrice && (
                      <span className="text-[10px] text-[#7C9588] line-through font-semibold">
                        ₹{item.originalPrice}
                      </span>
                    )}
                  </div>
                  {item.stockLeft != null && (
                    <span className="text-[9px] font-bold text-[#D96C37]">
                      {item.stockLeft} left
                    </span>
                  )}
                </div>
              </CardContent>

              {/* Reactions Row: Like, Dislike, Review */}
              <div className="mt-2 pt-1 border-t border-[#D6DCE2]/60 flex items-center justify-between px-1 text-[9px] text-[#5C7A6D]">
                <button
                  type="button"
                  onClick={() => toggleLike(item.id)}
                  className={`flex items-center gap-1 font-bold transition-all cursor-pointer ${
                    isLiked ? 'text-[#09431B] scale-105' : 'hover:text-[#09431B]'
                  }`}
                  aria-label="Like item"
                >
                  <ThumbsUp className={`w-3 h-3 ${isLiked ? 'fill-[#09431B]' : ''}`} />
                  <span>{item.likes}</span>
                </button>

                <button
                  type="button"
                  onClick={() => toggleDislike(item.id)}
                  className={`flex items-center gap-1 font-medium transition-all cursor-pointer ${
                    isDisliked ? 'text-red-600 scale-105' : 'hover:text-red-500'
                  }`}
                  aria-label="Dislike item"
                >
                  <ThumbsDown className={`w-3 h-3 ${isDisliked ? 'fill-red-500' : ''}`} />
                  <span>{item.dislikes}</span>
                </button>

                <button
                  type="button"
                  onClick={() => onReview?.(item)}
                  className="flex items-center gap-1 hover:text-[#09431B] font-medium transition-colors cursor-pointer"
                  aria-label="Write a review"
                >
                  <MessageSquare className="w-3 h-3" />
                  <span>{item.reviews}</span>
                </button>
              </div>

              {/* Action Button: Unified 10px Rounded Rectangle with Consistent Intention */}
              <div className="mt-2.5">
                {item.actionType === 'walkin' ? (
                  <Button
                    onClick={() => onWalkIn?.(item)}
                    variant="default"
                    size="sm"
                    className="w-full rounded-[10px] text-[11px] font-extrabold h-9 flex items-center justify-center gap-1.5 tracking-wide btn-green-shadow tactile-press cursor-pointer"
                  >
                    <MapPin className="w-3.5 h-3.5 fill-white/20" />
                    <span>WALK-IN (MAPS)</span>
                  </Button>
                ) : (
                  <Button
                    onClick={() => onOrderNow?.(item)}
                    variant="orange"
                    size="sm"
                    className="w-full rounded-[10px] text-[11px] font-black h-9 flex items-center justify-center gap-1.5 tracking-wide btn-orange-shadow tactile-press cursor-pointer"
                  >
                    <ShoppingCart className="w-3.5 h-3.5 fill-white/20" />
                    <span>+ ORDER • ₹{item.price}</span>
                  </Button>
                )}
              </div>
            </Card>
          );
        })}
      </div>

      {displayedItems.length === 0 && (
        <div className="mx-4 mt-8 p-6 text-center bg-[#E8ECEF] rounded-2xl border border-[#D6DCE2]">
          <p className="text-sm font-bold text-[#0A2E20]">No dishes found</p>
          <p className="text-xs text-[#5C7A6D] mt-1">Try clearing your search query or switching canteen filters.</p>
          <Button
            onClick={() => {
              setSearchQuery('');
              setSelectedShop('All');
            }}
            variant="outline"
            size="sm"
            className="mt-3"
          >
            Reset Filters
          </Button>
        </div>
      )}

      {/* Bottom iOS Home Indicator */}
      <div className="w-24 h-1 bg-[#09431B]/30 rounded-full mx-auto mt-6" />
    </div>
  );
};
