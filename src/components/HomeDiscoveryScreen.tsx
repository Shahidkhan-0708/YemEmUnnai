import React, { useState, useMemo } from 'react';
import { Search, ShoppingCart, ThumbsUp, MessageSquare, MapPin, ChevronRight, Sparkles, Flame, X, WifiOff } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Card, CardContent } from './ui/card';
import { Input } from './ui/input';
import { useFoodItems, useShops, useReactions } from '../lib/hooks';
import { isBackendConfigured } from '../lib/supabase';
import { cleanShopTag } from '../lib/api';
import { SaveToggle } from './SaveToggle';
import type { FoodCategory, FoodItem } from '../lib/types';

export type { FoodItem } from '../lib/types';

interface HomeDiscoveryScreenProps {
  cartCount?: number;
  onOrderNow?: (item: FoodItem) => void;
  onWalkIn?: (item: FoodItem) => void;
  onReview?: (item: FoodItem) => void;
  onCartClick?: () => void;
  onSelectShop?: (shopName: string) => void;
  onBusinessPortal?: () => void;
  onSelectItem?: (item: FoodItem) => void;
  onReplayIntro?: () => void;
  onOpenRadar?: () => void;
}

export const HomeDiscoveryScreen: React.FC<HomeDiscoveryScreenProps> = ({
  cartCount = 0,
  onOrderNow,
  onWalkIn,
  onReview,
  onCartClick,
  onSelectShop,
  onSelectItem,
  onReplayIntro,
  onOpenRadar,
  onBusinessPortal
}) => {
  const [selectedCategory, setSelectedCategory] = useState<FoodCategory>('cooked');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedShop, setSelectedShop] = useState<string>('All');
  const [savedItemIds, setSavedItemIds] = useState<Set<string>>(() => {
    try {
      const raw = localStorage.getItem('yemunnai_saved_items');
      return raw ? new Set<string>(JSON.parse(raw)) : new Set<string>();
    } catch {
      return new Set<string>();
    }
  });

  const handleToggleSave = (itemId: string, saved: boolean) => {
    setSavedItemIds((prev) => {
      const next = new Set(prev);
      if (saved) next.add(itemId);
      else next.delete(itemId);
      try {
        localStorage.setItem('yemunnai_saved_items', JSON.stringify(Array.from(next)));
      } catch {}
      return next;
    });
  };

  const shops = useShops();
  const { items, loading, totalByCategory } = useFoodItems(selectedCategory);
  const { myReactions, counts, toggleLike } = useReactions(items);

  // Filter by query + shop, hiding offline shop items when browsing all shops
  const displayedItems = items
    .filter(item => {
      const q = searchQuery.toLowerCase();
      const matchesQuery = item.name.toLowerCase().includes(q) ||
                           item.vendor.toLowerCase().includes(q);
      const matchesShop = selectedShop === 'All' || item.vendor.toLowerCase().includes(selectedShop.toLowerCase());

      // Check if this item's shop is offline
      const shopMeta = shops.find(s => s.name.toLowerCase() === item.vendor.toLowerCase());
      const isShopOffline = shopMeta ? shopMeta.isOnline === false : item.isShopOnline === false;

      // When browsing 'All' canteens, do not display products from offline canteens
      if (selectedShop === 'All' && isShopOffline) {
        return false;
      }

      return matchesQuery && matchesShop;
    })
    .map(item => {
      const c = counts[item.id];
      const shopMeta = shops.find(s => s.name.toLowerCase() === item.vendor.toLowerCase());
      const isShopOffline = shopMeta ? shopMeta.isOnline === false : item.isShopOnline === false;
      return {
        ...item,
        likes: c ? c.likes : item.likes,
        dislikes: c ? c.dislikes : item.dislikes,
        isShopOnline: !isShopOffline
      };
    });

  // Group items by shop when browsing "All" shops and no search query is typed
  const shopGroups = useMemo(() => {
    if (selectedShop !== 'All' || searchQuery.trim()) return null;
    const map: Record<string, FoodItem[]> = {};
    for (const item of displayedItems) {
      if (!map[item.vendor]) map[item.vendor] = [];
      map[item.vendor].push(item);
    }
    return Object.entries(map).map(([vendorName, groupItems]) => {
      const shopMeta = shops.find(s => s.name.toLowerCase() === vendorName.toLowerCase());
      return { vendorName, shopMeta, items: groupItems };
    });
  }, [displayedItems, selectedShop, searchQuery, shops]);

  const renderFoodCard = (item: FoodItem) => {
    const isLiked = myReactions[item.id] === 'like';

    return (
      <Card
        key={item.id}
        className="tactile-card rounded-[20px] p-2.5 flex flex-col justify-between"
      >
        {/* Real Food Photograph with Live Badges */}
        <div
          className="w-full aspect-4/3 rounded-[14px] overflow-hidden bg-slate-100 relative shadow-xs cursor-pointer"
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

          {/* Bottom Scrim overlay */}
          <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/10 to-transparent pointer-events-none" />

          {/* Freshness or Sold Out Badge overlay */}
          {!item.inStock ? (
            <div className="absolute top-1.5 left-1.5 bg-red-600/95 backdrop-blur-xs text-white text-[8px] font-black px-2 py-0.5 rounded-full flex items-center gap-1 border border-red-400/40 shadow-xs">
              <span className="w-1.5 h-1.5 rounded-full bg-white" />
              <span>SOLD OUT</span>
            </div>
          ) : item.freshnessTag ? (
            <div className="absolute top-1.5 left-1.5 bg-[#1F140A]/95 backdrop-blur-xs text-white text-[8px] font-extrabold px-2 py-0.5 rounded-full flex items-center gap-1 border border-emerald-500/40 shadow-xs">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>{item.freshnessTag}</span>
            </div>
          ) : null}

          {/* Quick Bookmark SaveToggle */}
          <div
            className="absolute top-1.5 right-1.5 z-10"
            onClick={(e) => e.stopPropagation()}
          >
            <SaveToggle
              size="sm"
              idleText=""
              savedText=""
              loadingDuration={600}
              successDuration={800}
              isSaved={savedItemIds.has(item.id)}
              onToggle={(saved) => handleToggleSave(item.id, saved)}
              className="h-6! w-6! p-0! rounded-full! shadow-xs bg-white/85 hover:bg-white backdrop-blur-xs border border-white/60 text-[#1F140A]"
            />
          </div>

          {/* Landmark overlay — real campus landmark */}
          <div className="absolute bottom-1.5 right-1.5 bg-[#1F140A]/90 backdrop-blur-xs text-[#FFEAD9] text-[8.5px] font-extrabold px-2 py-0.5 rounded-md flex items-center gap-1 shadow-xs border border-white/20">
            <MapPin className="w-2.5 h-2.5 text-emerald-400 shrink-0" />
            <span className="max-w-20 truncate">{item.locationLandmark || item.walkTime}</span>
          </div>

          {/* Service Mode Badge: Walk-In (Emerald) vs Order In (Orange) */}
          <div className="absolute bottom-1.5 left-1.5 z-10 flex items-center gap-1">
            {item.actionType === 'walkin' ? (
              <span className="bg-emerald-700/95 backdrop-blur-xs text-white text-[8px] font-black px-1.5 py-0.5 rounded-md flex items-center gap-0.5 shadow-xs border border-emerald-400/40">
                <MapPin className="w-2.5 h-2.5 text-emerald-200" />
                <span>WALK-IN</span>
              </span>
            ) : (
              <span className="bg-[#F06A05]/95 backdrop-blur-xs text-white text-[8px] font-black px-1.5 py-0.5 rounded-md flex items-center gap-0.5 shadow-xs border border-orange-300/40">
                <ShoppingCart className="w-2.5 h-2.5 text-white" />
                <span>ORDER IN</span>
              </span>
            )}
          </div>
        </div>

        {/* Title & Info with Indian Veg/Non-veg indicator */}
        <CardContent className="mt-2 px-1 p-0">
          <div className="flex items-center gap-1.5">
            <span
              className={`w-3 h-3 border ${item.isVeg !== false ? 'border-emerald-700' : 'border-amber-800'} flex items-center justify-center p-0.5 rounded-xs shrink-0 bg-white/70`}
              title={item.isVeg !== false ? 'Vegetarian' : 'Non-Vegetarian'}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${item.isVeg !== false ? 'bg-emerald-700' : 'bg-amber-800'}`} />
            </span>
            <h3 className="text-[13px] font-extrabold text-[#1F140A] leading-snug truncate">
              {item.name}
            </h3>
          </div>

          <p className="text-[10px] font-medium text-[#7A6658] mt-0.5 truncate flex items-center justify-between">
            <span className="truncate max-w-23.75">{item.vendor}</span>
            {item.reviews > 0 && item.rating != null ? (
              <span className="text-amber-600 font-bold">★ {Number(item.rating).toFixed(1)}</span>
            ) : (
              <span className="text-emerald-700 font-bold text-[9px] bg-emerald-500/10 px-1 py-0.2 rounded">New</span>
            )}
          </p>

          <div className="mt-1 flex items-baseline justify-between">
            <div className="flex items-baseline gap-1.5">
              {item.price > 0 ? (
                <>
                  <span className={`text-[15px] font-black ${
                    item.actionType === 'walkin' ? 'text-emerald-700' : 'text-[#F06A05]'
                  }`}>
                    ₹{item.price}
                  </span>
                  {item.originalPrice && (
                    <span className="text-[10px] text-[#7A6658] line-through font-semibold">
                      ₹{item.originalPrice}
                    </span>
                  )}
                </>
              ) : (
                <span className="text-[11px] font-black text-[#D96C37] bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/25">
                  Coming Soon
                </span>
              )}
            </div>
            {item.price > 0 && item.stockLeft != null && (
              <span className="text-[9px] font-bold text-[#D96C37]">
                {item.stockLeft} left
              </span>
            )}
          </div>
        </CardContent>

        {/* Reactions Row: Like, Review */}
        <div className="mt-2 pt-1 border-t border-[#D6DCE2]/60 flex items-center justify-between px-1 text-[9px] text-[#7A6658]">
          <button
            type="button"
            onClick={() => toggleLike(item.id)}
            className={`flex items-center gap-1 font-bold transition-all cursor-pointer ${
              isLiked ? 'text-[#F06A05] scale-105' : 'hover:text-[#F06A05]'
            }`}
            aria-label="Like item"
          >
            <ThumbsUp className={`w-3 h-3 ${isLiked ? 'fill-[#F06A05]' : ''}`} />
            <span>{item.likes}</span>
          </button>

          <button
            type="button"
            onClick={() => onReview?.(item)}
            className="flex items-center gap-1 hover:text-[#F06A05] font-medium transition-colors cursor-pointer"
            aria-label="Write a review"
          >
            <MessageSquare className="w-3 h-3" />
            <span>{item.reviews}</span>
          </button>
        </div>

        {/* Action Button: Unified 10px Rounded Rectangle with Distinct Color Intentions */}
        <div className="mt-2.5">
          {!item.inStock ? (
            <Button
              disabled
              variant="outline"
              size="sm"
              className="w-full rounded-[10px] text-[11px] font-black h-9 flex items-center justify-center gap-1.5 bg-[#D5DCE2] text-slate-500 border border-[#BAC3CC] cursor-not-allowed opacity-80 shadow-none"
            >
              <span>SOLD OUT</span>
            </Button>
          ) : item.isShopOnline === false ? (
            <Button
              disabled
              variant="outline"
              size="sm"
              className="w-full rounded-[10px] text-[10.5px] font-black h-9 flex items-center justify-center gap-1.5 bg-[#D5DCE2] text-slate-500 border border-[#BAC3CC] cursor-not-allowed opacity-80 shadow-none"
            >
              <span>CANTEEN OFFLINE</span>
            </Button>
          ) : (!item.price || item.price <= 0) ? (
            <Button
              disabled
              variant="outline"
              size="sm"
              className="w-full rounded-[10px] text-[10.5px] font-black h-9 flex items-center justify-center gap-1.5 bg-[#D5DCE2] text-slate-500 border border-[#BAC3CC] cursor-not-allowed opacity-80 shadow-none select-none"
            >
              <span>COMING SOON</span>
            </Button>
          ) : item.actionType === 'walkin' ? (
            <Button
              onClick={() => onWalkIn?.(item)}
              variant="walkin"
              size="sm"
              className="w-full rounded-[10px] text-[11px] font-extrabold h-9 flex items-center justify-center gap-1.5 tracking-wide btn-green-shadow tactile-press cursor-pointer"
            >
              <MapPin className="w-3.5 h-3.5 fill-white/20" />
              <span>WALK-IN (MAPS)</span>
            </Button>
          ) : (
            <Button
              onClick={() => onOrderNow?.(item)}
              variant="order"
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
  };

  return (
    <div className="w-full max-w-97.5 mx-auto bg-[#E8ECEF] min-h-205 pb-10 select-none overflow-hidden relative shadow-2xl rounded-[36px] border border-[#D6DCE2] font-sans">
      
      {/* TOP BRAND ORANGE HEADER MATCHING NEWLOGO BACKGROUND #F06A05 */}
      <div className="bg-[#F06A05] px-4 pt-6 pb-6 rounded-b-[30px] text-white shadow-lg">
        
        {/* Animated Brand Identity Header with Logo & Tagline */}
        <div className="flex items-center justify-between mb-3.5 px-0.5">
          <button
            type="button"
            onClick={onBusinessPortal}
            aria-label="Open Vendor Business Portal"
            title="Vendor Login / Business Portal"
            className="flex items-center gap-2.5 cursor-pointer tactile-press text-left p-0 bg-transparent border-0 group transition-transform active:scale-95"
          >
            <div className="relative w-10 h-10 rounded-xl bg-[#F06A05] border border-white/30 p-0.5 flex items-center justify-center shadow-md overflow-hidden group-hover:scale-105 group-hover:border-white/60 transition-all">
              <img
                src="/images/NewLogo.svg"
                alt="YEM UNNAI Mascot"
                className="w-full h-full object-contain animate-mascot-float"
              />
            </div>
            <div>
              <div className="flex items-center gap-1.5 leading-none">
                <span className="text-[15px] font-black tracking-tight text-white group-hover:text-amber-100 transition-colors">YEMUNNAI</span>
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
              </div>
              <div className="flex items-center gap-1 text-[8.5px] font-extrabold tracking-wider uppercase text-white/90 mt-0.5">
                <span className="animate-brand-shimmer">A FOOD DISCOVERY PLATFORM</span>
              </div>
            </div>
          </button>

          {/* Quick Access Badges for Intro & Campus Radar */}
          <div className="flex items-center gap-1.5">
            {onReplayIntro && (
              <button
                type="button"
                onClick={onReplayIntro}
                title="Replay Brand Intro Splash"
                className="text-[10px] font-extrabold text-white hover:text-white bg-white/20 hover:bg-white/30 px-2.5 py-1 rounded-full transition-all cursor-pointer border border-white/25 flex items-center gap-1 active:scale-95"
              >
                <span>🎬 Intro</span>
              </button>
            )}
            {onOpenRadar && (
              <button
                type="button"
                onClick={onOpenRadar}
                title="Campus Radar & Geofence"
                className="text-[10px] font-extrabold text-amber-300 hover:text-white bg-amber-500/20 hover:bg-amber-500/30 px-2.5 py-1 rounded-full transition-all cursor-pointer border border-amber-500/35 flex items-center gap-1 active:scale-95"
              >
                <span>📡 Radar</span>
              </button>
            )}
          </div>
        </div>

        {/* Search Bar + Orange Circular Cart Button */}
        <div className="flex items-center gap-3">
          <div className="flex-1 relative flex items-center bg-[#E8ECEF]/95 backdrop-blur-xs border border-[#D6DCE2] rounded-full px-4 py-2 shadow-inner transition-all focus-within:ring-2 focus-within:ring-[#F06A05] focus-within:bg-white">
            <Search className="w-4 h-4 text-[#7A6658] shrink-0 mr-2.5" />
            <Input
              aria-label="Search food and canteens"
              type="text"
              placeholder="Search tea, samosa, puff, coffee..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-8 p-0 border-0 focus-visible:ring-0 text-xs"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="p-1 text-[#7A6658] hover:text-[#1F140A]">
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
            <div className="flex items-center gap-1 text-[11px] text-[#FFEAD9] group-hover:text-white transition-colors">
              <span>{selectedShop === 'All' ? 'View All' : `Filter: ${selectedShop}`}</span>
              <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </div>

          {/* Symmetrical Horizontal Scrolling Shop Avatars */}
          <div className="-mx-4 px-4 flex items-start gap-2.5 overflow-x-auto no-scrollbar pt-1 pb-1">
            {shops
              .filter(shop => shop.isActive !== false && !['royal hotel', 'royal corner', 'chai corner', 'vatika', 'vatika tuck', 'lays corner'].includes(shop.name.toLowerCase()))
              .map((shop) => {
              const isSelected = selectedShop.toLowerCase() === shop.name.toLowerCase();
              const displayTag = shop.isOnline === false ? '🔴 Closed' : cleanShopTag(shop.tag);

              return (
                <div 
                  key={shop.id} 
                  onClick={() => {
                    const next = isSelected ? 'All' : shop.name;
                    setSelectedShop(next);
                    onSelectShop?.(next);
                  }}
                  className="w-18 shrink-0 flex flex-col items-center cursor-pointer group select-none text-center"
                >
                  <div className={`relative w-14 h-14 rounded-full p-0.5 transition-all duration-200 group-hover:scale-105 flex items-center justify-center shrink-0 ${
                    isSelected ? 'ring-3 ring-[#F26A00] scale-105 shadow-md' : 'ring-2 ring-white/30'
                  }`}>
                    <img
                      src={shop.image}
                      alt={shop.name}
                      className="w-full h-full object-cover rounded-full"
                      loading="lazy"
                    />
                    {shop.isOnline === false ? (
                      <span className="absolute -top-1 -right-1 px-1.5 py-0.2 rounded-full bg-slate-800 text-[7px] font-black text-slate-300 border border-white/20 shadow-xs">
                        CLOSED
                      </span>
                    ) : shop.isActive ? (
                      <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-[#10B981] border-2 border-[#F06A05] rounded-full animate-radar-ring" />
                    ) : null}
                  </div>
                  <span className={`text-[10.5px] font-bold tracking-tight text-center w-full truncate leading-tight mt-1.5 ${
                    isSelected ? 'text-[#FF8A2A]' : 'text-white'
                  }`}>
                    {shop.name}
                  </span>
                  <span className="text-[8.5px] text-white/80 font-medium text-center w-full truncate leading-tight mt-0.5">
                    {displayTag}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Offline Shop Notice when filtering by a specific shop that is closed */}
      {selectedShop !== 'All' && shops.find(s => s.name.toLowerCase() === selectedShop.toLowerCase())?.isOnline === false && (
        <div className="mx-4 mt-3 p-3 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-900 text-xs flex items-center gap-2.5">
          <span className="text-lg">🔴</span>
          <div>
            <p className="font-extrabold text-[12px] text-[#1F140A]">{selectedShop} is currently Offline</p>
            <p className="text-[10px] text-[#7A6658] font-medium leading-tight">This canteen is not accepting orders right now. Items below are for viewing only.</p>
          </div>
        </div>
      )}

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
                ? 'bg-[#F06A05] text-white shadow-md'
                : 'text-[#F06A05] hover:bg-black/5'
            }`}
          >
            <Flame className="w-3.5 h-3.5 text-amber-400" />
            <span>Cooked Foods ({totalByCategory.cooked})</span>
          </button>

          <button
            onClick={() => setSelectedCategory('packed')}
            className={`flex-1 py-1.5 px-3 rounded-full text-xs font-bold transition-all text-center flex items-center justify-center gap-1.5 cursor-pointer ${
              selectedCategory === 'packed'
                ? 'bg-[#F06A05] text-white shadow-md'
                : 'text-[#F06A05] hover:bg-black/5'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Packed Foods ({totalByCategory.packed})</span>
          </button>
        </div>
      </div>

      {/* FOOD CARDS: GROUPED BY SHOP WHEN VIEWING ALL, OR FLAT GRID WHEN FILTERED */}
      {loading && displayedItems.length === 0 ? (
        <div className="px-4 mt-3.5 grid grid-cols-2 gap-3">
          {[0, 1, 2, 3].map(i => (
            <Card key={i} className="tactile-card rounded-[20px] p-2.5 animate-pulse">
              <div className="w-full aspect-4/3 rounded-[14px] bg-[#DDE2E8]" />
              <div className="mt-2 px-1 space-y-1.5">
                <div className="h-3 w-3/4 rounded bg-[#DDE2E8]" />
                <div className="h-2.5 w-1/2 rounded bg-[#DDE2E8]" />
                <div className="h-3 w-1/3 rounded bg-[#DDE2E8]" />
              </div>
            </Card>
          ))}
        </div>
      ) : shopGroups ? (
        /* Shop-grouped view: eliminates repeating tea/coffee/samosa loop */
        <div className="px-4 mt-4 space-y-5">
          {shopGroups.map(group => (
            <div key={group.vendorName} className="space-y-2">
              <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-2">
                  {group.shopMeta && (
                    <img
                      src={group.shopMeta.image}
                      alt={group.vendorName}
                      className="w-5 h-5 rounded-full object-cover ring-1 ring-[#F06A05]"
                    />
                  )}
                  <h3 className="text-[12.5px] font-black text-[#1F140A] leading-none">
                    {group.vendorName}
                  </h3>
                  <span className="text-[9px] font-semibold text-[#7A6658]">
                    • {group.shopMeta?.tag || group.shopMeta?.locationLandmark || 'Campus'}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedShop(group.vendorName);
                    onSelectShop?.(group.vendorName);
                  }}
                  className="text-[9.5px] font-bold text-[#F06A05] bg-orange-100/80 hover:bg-orange-200/90 px-2 py-0.5 rounded-full transition-colors cursor-pointer"
                >
                  View menu ({group.items.length})
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {group.items.map(item => renderFoodCard(item))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Filtered/Search view */
        <div className="px-4 mt-3.5 grid grid-cols-2 gap-3">
          {displayedItems.map(item => renderFoodCard(item))}
        </div>
      )}

      {displayedItems.length === 0 && (
        <div className="mx-4 mt-8 p-6 text-center bg-[#E8ECEF] rounded-2xl border border-[#D6DCE2]">
          <p className="text-sm font-bold text-[#1F140A]">No dishes found</p>
          <p className="text-xs text-[#7A6658] mt-1">Try clearing your search query or switching canteen filters.</p>
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
    </div>
  );
};
