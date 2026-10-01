import { supabase, isBackendConfigured } from './supabase';
import { DEFAULT_FOOD_ITEMS, LOCAL_SHOPS } from './mockData';
import type {
  FoodItem,
  FoodItemRow,
  FoodCategory,
  ActionType,
  ShopEntry,
  DashboardOrder,
  OrderRow,
  OrderStatus,
  ReactionValue,
  VendorStats,
  NewFoodItemInput
} from './types';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

import { safeStorage } from './storage';

/** Stable per-browser visitor key, e.g. "anon:9f3c…" (consumers have no account). */
export function getUserKey(): string {
  const KEY = 'yememunnai_user_key';
  try {
    let key = safeStorage.getItem(KEY);
    if (!key) {
      const uuid =
        typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
          ? crypto.randomUUID()
          : Math.random().toString(36).substring(2, 10) + Date.now().toString(36);
      key = `anon:${uuid}`;
      safeStorage.setItem(KEY, key);
    }
    return key;
  } catch {
    return 'anon:guest';
  }
}

// ---------------------------------------------------------------------------
// Reactive In-Memory Catalog Store (synchronizes Seller Terminal & Buyer Feed)
// ---------------------------------------------------------------------------

let inMemoryFoodItems: FoodItem[] = DEFAULT_FOOD_ITEMS.map(i => ({ ...i, isShopOnline: true }));
let inMemoryShops: ShopEntry[] = LOCAL_SHOPS.map(s => ({ ...s, isOnline: true }));
const catalogSubscribers = new Set<() => void>();

function notifySubscribers() {
  catalogSubscribers.forEach(cb => {
    try {
      cb();
    } catch (e) {
      console.error('[api] catalog subscriber error:', e);
    }
  });
}

export function subscribeCatalogUpdates(callback: () => void): () => void {
  catalogSubscribers.add(callback);
  return () => {
    catalogSubscribers.delete(callback);
  };
}

function rowToItem(row: FoodItemRow): FoodItem {
  const ratings = (row.reviews ?? []).map(r => r.rating);
  // Never default to a fake 4.5 star rating when there are 0 reviews
  const avg = ratings.length
    ? Math.round((ratings.reduce((a, b) => a + b, 0) / ratings.length) * 10) / 10
    : (row.reviews_count > 0 ? 4.5 : null);
  const vendorInfo = row.vendors;
  const landmark = vendorInfo?.location_landmark ?? undefined;
  const walkTime = landmark || (vendorInfo?.is_on_campus === false
    ? '8 min walk'
    : (vendorInfo?.name.toLowerCase().includes('canteen') ? 'Food Court' : 'Campus Center'));

  const isDrink = /tea|coffee|milk/i.test(row.name);
  const isPacked = row.category === 'packed' || /batanees|popsicle|chips|lays|biscuit/i.test(row.name);
  const freshnessTag = isDrink
    ? '☕ Fresh Brew'
    : isPacked
    ? '📦 Sealed Pack'
    : (row.name.toLowerCase().includes('samosa') ? '🔥 Fresh Batch' : undefined);

  const isNonVeg = /chicken|mutton|egg|meat|fish|prawn/i.test(row.name);

  return {
    id: row.id,
    vendorId: row.vendor_id,
    name: row.name,
    vendor: vendorInfo?.name ?? 'Unknown shop',
    price: row.price,
    category: row.category,
    image: row.image_url ?? '/images/item_samosa_chicken.jpg',
    likes: row.likes_count,
    dislikes: row.dislikes_count,
    reviews: row.reviews_count,
    rating: avg,
    freshnessTag,
    walkTime,
    actionType: row.action_type,
    inStock: row.in_stock,
    isVeg: !isNonVeg,
    latitude: vendorInfo?.latitude ?? undefined,
    longitude: vendorInfo?.longitude ?? undefined,
    locationLandmark: landmark,
    isOnCampus: vendorInfo?.is_on_campus ?? true,
    isShopOnline: vendorInfo?.is_online ?? true
  };
}

function orderRowToDashboard(row: OrderRow, vendorName: string): DashboardOrder {
  return {
    id: row.id,
    item: row.item_name,
    price: row.unit_price,
    vendor: vendorName,
    phone: row.customer_mobile,
    location: row.delivery_address,
    image: row.food_items?.image_url ?? '/images/item_samosa_chicken.jpg',
    status: row.status
  };
}

// ---------------------------------------------------------------------------
// Discovery (consumer home)
// ---------------------------------------------------------------------------

export async function fetchFoodItems(category?: FoodCategory): Promise<FoodItem[]> {
  if (!supabase) {
    let items = inMemoryFoodItems;
    if (category) items = items.filter(i => i.category === category);
    return items;
  }

  let query = supabase
    .from('food_items')
    .select('id, vendor_id, name, price, category, action_type, image_url, in_stock, likes_count, dislikes_count, reviews_count, created_at, vendors(name, is_online, latitude, longitude, location_landmark, is_on_campus), reviews(rating)')
    .order('created_at', { ascending: true });

  if (category) query = query.eq('category', category);

  const { data, error } = await query;
  if (error) {
    console.error('[api] fetchFoodItems:', error.message);
    let items = inMemoryFoodItems;
    if (category) items = items.filter(i => i.category === category);
    return items;
  }
  return (data as unknown as FoodItemRow[]).map(rowToItem);
}

export function cleanShopTag(tag?: string | null): string {
  if (!tag) return 'Campus';
  const lower = tag.toLowerCase();
  if (lower.includes('food court')) return 'Food Court';
  if (lower.includes('main block')) return 'Main Block';
  if (lower.includes('library')) return 'Library';
  if (lower.includes('gate')) return 'Gate Block';
  if (lower.includes('hostel')) return 'Boys Hostel';
  return tag.replace(/,.*$/, '').trim();
}

export async function fetchShops(): Promise<ShopEntry[]> {
  if (!supabase) return inMemoryShops;

  const EXCLUDED_SHOPS = new Set(['royal hotel', 'royal corner', 'chai corner', 'vatika', 'vatika tuck', 'lays corner']);

  const { data, error } = await supabase
    .from('vendors')
    .select('id, name, image_url, is_active, is_online, latitude, longitude, location_landmark, is_on_campus')
    .eq('is_active', true)
    .order('is_active', { ascending: false });

  /** Campus showcase order requested by the client (top of the shops row). */
  const SHOP_PRIORITY = ['MITS Canteen', 'MITS Cafe', "Ekdant's Cafe", 'Lickies', 'New Cafe'];
  const priority = (name: string) => {
    const idx = SHOP_PRIORITY.indexOf(name);
    return idx === -1 ? SHOP_PRIORITY.length : idx;
  };

  if (error) {
    console.error('[api] fetchShops:', error.message);
    return inMemoryShops.filter(s => !EXCLUDED_SHOPS.has(s.name.toLowerCase()));
  }
  return (data as Array<{ id: string; name: string; image_url: string | null; is_active: boolean; is_online: boolean; latitude?: number | null; longitude?: number | null; location_landmark?: string | null; is_on_campus?: boolean | null }>)
    .filter(v => v.is_active && !EXCLUDED_SHOPS.has(v.name.toLowerCase()))
    .sort((a, b) => priority(a.name) - priority(b.name))
    .map(v => ({
    id: v.id,
    name: v.name,
    image: v.image_url ?? '/images/shop_mits_canteen.jpg',
    isActive: v.is_active,
    isOnline: v.is_online ?? true,
    latitude: v.latitude ?? undefined,
    longitude: v.longitude ?? undefined,
    locationLandmark: v.location_landmark ?? undefined,
    tag: cleanShopTag(v.location_landmark || (v.is_on_campus === false ? 'Off-campus' : 'Campus Center'))
  }));
}

/**
 * Toggle like/dislike for this visitor. server-side logic:
 *  - first click  → insert row ("anon:<key>")
 *  - same again   → delete row (undo)
 *  - opposite     → update row (switch)
 * The reactions trigger keeps food_items counts correct.
 * Returns nothing; callers re-fetch or patch counts optimistically.
 */
export async function setReaction(foodItemId: string, value: ReactionValue): Promise<void> {
  if (!supabase) return; // demo mode: local state only

  const userKey = getUserKey();

  const { data: existing } = await supabase
    .from('reactions')
    .select('id, value')
    .eq('food_item_id', foodItemId)
    .eq('user_key', userKey)
    .maybeSingle();

  if (!existing) {
    const { error } = await supabase
      .from('reactions')
      .insert({ food_item_id: foodItemId, user_key: userKey, value });
    if (error) console.error('[api] setReaction insert:', error.message);
    return;
  }

  if (existing.value === value) {
    const { error } = await supabase.from('reactions').delete().eq('id', existing.id);
    if (error) console.error('[api] setReaction delete:', error.message);
  } else {
    const { error } = await supabase
      .from('reactions')
      .update({ value })
      .eq('id', existing.id);
    if (error) console.error('[api] setReaction update:', error.message);
  }
}

/** Reaction rows cast by this browser, keyed by food_item_id. */
export async function fetchMyReactions(): Promise<Record<string, ReactionValue>> {
  if (!supabase) return {};

  const { data, error } = await supabase
    .from('reactions')
    .select('food_item_id, value')
    .eq('user_key', getUserKey());

  if (error) {
    console.error('[api] fetchMyReactions:', error.message);
    return {};
  }
  const out: Record<string, ReactionValue> = {};
  for (const r of data as Array<{ food_item_id: string; value: ReactionValue }>) {
    out[r.food_item_id] = r.value;
  }
  return out;
}

/**
 * Fetch reaction counts for a single food item.
 * Scalable P0 fix: avoids full catalog re-fetches when users like/dislike items.
 */
export async function fetchItemReactionCounts(itemId: string): Promise<{ likes: number; dislikes: number } | null> {
  if (!supabase) {
    const item = inMemoryFoodItems.find(i => i.id === itemId);
    return item ? { likes: item.likes, dislikes: item.dislikes } : null;
  }
  try {
    const { data, error } = await supabase
      .from('food_items')
      .select('likes_count, dislikes_count')
      .eq('id', itemId)
      .single();

    if (error || !data) {
      return null;
    }
    return {
      likes: data.likes_count ?? 0,
      dislikes: data.dislikes_count ?? 0
    };
  } catch (err) {
    console.error('[api] fetchItemReactionCounts error:', err);
    return null;
  }
}

// ---------------------------------------------------------------------------
// Reviews (feedback popup)
// ---------------------------------------------------------------------------

export async function submitReview(input: {
  foodItemId: string;
  rating: number;
  isLiked: boolean;
  comment: string;
}): Promise<boolean> {
  if (!supabase) return true; // demo mode

  const { error } = await supabase.from('reviews').insert({
    food_item_id: input.foodItemId,
    user_key: getUserKey(),
    rating: input.rating,
    is_liked: input.isLiked,
    comment: input.comment
  });
  if (error) {
    console.error('[api] submitReview:', error.message);
    return false;
  }
  return true;
}

// ---------------------------------------------------------------------------
// Orders (quick order modal → business dashboard feed)
// ---------------------------------------------------------------------------

export async function placeOrder(input: {
  foodItem: FoodItem;
  mobile: string;
  address: string;
  quantity?: number;
}): Promise<{ success: boolean; token?: string; orderId?: string; reason?: string }> {
  // Defense-in-depth: check if item is in stock
  if (input.foodItem.inStock === false) {
    return { success: false, reason: 'This item is sold out' };
  }

  // Check if shop is online
  if (input.foodItem.isShopOnline === false) {
    return { success: false, reason: 'This canteen is currently offline' };
  }

  const clientOrderId = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : undefined;
  const numPart = (clientOrderId || `${Date.now()}`).replace(/\D/g, '');
  const token = numPart.length >= 3 ? numPart.slice(-3) : Math.floor(100 + Math.random() * 900).toString();

  const qty = input.quantity && input.quantity > 0 ? input.quantity : 1;
  const totalPrice = input.foodItem.price * qty;
  const itemName = qty > 1 ? `${input.foodItem.name} (${qty}x)` : input.foodItem.name;

  if (!supabase) {
    return { success: true, token, orderId: clientOrderId || `demo-${Date.now()}` };
  }

  const payload: Record<string, unknown> = {
    vendor_id: input.foodItem.vendorId,
    food_item_id: input.foodItem.id,
    item_name: itemName,
    unit_price: totalPrice,
    customer_mobile: input.mobile,
    delivery_address: input.address
  };
  if (clientOrderId) {
    payload.id = clientOrderId;
  }

  const { error } = await supabase.from('orders').insert(payload);

  if (error) {
    console.error('[api] placeOrder:', error.message);
    return { success: false };
  }

  return { success: true, token, orderId: clientOrderId };
}

/**
 * Live order feed for one vendor. `onData` is invoked on every change
 * (initial load + realtime inserts/updates).
 * Uses debouncing to prevent high-concurrency re-fetch storms.
 */
export function subscribeVendorOrders(
  vendorId: string,
  onData: (orders: DashboardOrder[]) => void
): () => void {
  if (!supabase) return () => {};

  const mapRows = (rows: OrderRow[]) => rows.map(r => orderRowToDashboard(r, 'Your Shop'));
  let debounceTimer: ReturnType<typeof setTimeout> | null = null;

  const load = async () => {
    const { data, error } = await supabase!
      .from('orders')
      .select('id, vendor_id, food_item_id, item_name, unit_price, customer_mobile, delivery_address, status, created_at, food_items(image_url)')
      .eq('vendor_id', vendorId)
      .in('status', ['pending', 'accepted'])
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) {
      console.error('[api] subscribeVendorOrders load:', error.message);
      return;
    }
    onData(mapRows(data as unknown as OrderRow[]));
  };

  const scheduleLoad = () => {
    if (debounceTimer) clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      void load();
    }, 250);
  };

  void load();

  const channel = supabase
    .channel(`vendor-orders-${vendorId}`)
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'orders', filter: `vendor_id=eq.${vendorId}` },
      () => scheduleLoad()
    )
    .subscribe();

  return () => {
    if (debounceTimer) clearTimeout(debounceTimer);
    void supabase!.removeChannel(channel);
  };
}

export async function setOrderStatus(orderId: string, status: OrderStatus): Promise<void> {
  // Broadcast locally for instant reactivity within the current app window
  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent('yememunnai:order-status-update', {
        detail: { orderId, status }
      })
    );
  }

  if (!supabase) return;
  const { error } = await supabase.from('orders').update({ status }).eq('id', orderId);
  if (error) console.error('[api] setOrderStatus:', error.message);
}

export async function fetchOrderStatus(orderId: string): Promise<OrderStatus | null> {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase
      .from('orders')
      .select('status')
      .eq('id', orderId)
      .single();
    if (error || !data) return null;
    return data.status as OrderStatus;
  } catch (e) {
    console.error('[api] fetchOrderStatus error:', e);
    return null;
  }
}

// ---------------------------------------------------------------------------
// Shared Realtime Channel for Consumer Orders (Scale P0 fix: avoids 300+ channels)
// ---------------------------------------------------------------------------
const orderStatusListeners = new Map<string, Set<(status: OrderStatus) => void>>();
let sharedConsumerOrdersChannel: ReturnType<NonNullable<typeof supabase>['channel']> | null = null;
let pollTimer: ReturnType<typeof setInterval> | null = null;

function ensureSharedOrdersChannel() {
  if (!supabase || sharedConsumerOrdersChannel) return;

  sharedConsumerOrdersChannel = supabase
    .channel('consumer-orders-shared')
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'orders'
      },
      (payload) => {
        const orderId = payload.new?.id as string;
        const newStatus = payload.new?.status as OrderStatus;
        if (orderId && newStatus) {
          const listeners = orderStatusListeners.get(orderId);
          if (listeners) {
            listeners.forEach(cb => {
              try { cb(newStatus); } catch (err) { console.error('[api] status callback error:', err); }
            });
          }
        }
      }
    )
    .subscribe();

  // Fallback poll: every 8s while any consumer in this tab is waiting on an order
  if (!pollTimer) {
    pollTimer = setInterval(async () => {
      if (orderStatusListeners.size === 0) return;
      for (const [orderId, listeners] of orderStatusListeners.entries()) {
        const currentStatus = await fetchOrderStatus(orderId);
        if (currentStatus) {
          listeners.forEach(cb => {
            try { cb(currentStatus); } catch (err) { console.error('[api] poll callback error:', err); }
          });
        }
      }
    }, 8000);
  }
}

function cleanupSharedOrdersChannelIfIdle() {
  if (orderStatusListeners.size === 0) {
    if (pollTimer) {
      clearInterval(pollTimer);
      pollTimer = null;
    }
    if (sharedConsumerOrdersChannel && supabase) {
      void supabase.removeChannel(sharedConsumerOrdersChannel);
      sharedConsumerOrdersChannel = null;
    }
  }
}

/**
 * Real-time order status listener for consumers.
 * Uses a single multiplexed channel per browser session and fallback polling.
 */
export function subscribeOrderStatus(
  orderId: string,
  onStatusChange: (status: OrderStatus) => void
): () => void {
  // 1. Local event listener for instant responsiveness in same tab
  const handleLocalEvent = (e: Event) => {
    const custom = e as CustomEvent<{ orderId: string; status: OrderStatus }>;
    if (custom.detail?.orderId === orderId) {
      onStatusChange(custom.detail.status);
    }
  };

  if (typeof window !== 'undefined') {
    window.addEventListener('yememunnai:order-status-update', handleLocalEvent);
  }

  // 2. Register in shared listeners map
  let listeners = orderStatusListeners.get(orderId);
  if (!listeners) {
    listeners = new Set();
    orderStatusListeners.set(orderId, listeners);
  }
  listeners.add(onStatusChange);

  // 3. Ensure single shared channel is active
  ensureSharedOrdersChannel();

  return () => {
    if (typeof window !== 'undefined') {
      window.removeEventListener('yememunnai:order-status-update', handleLocalEvent);
    }
    const currentListeners = orderStatusListeners.get(orderId);
    if (currentListeners) {
      currentListeners.delete(onStatusChange);
      if (currentListeners.size === 0) {
        orderStatusListeners.delete(orderId);
      }
    }
    cleanupSharedOrdersChannelIfIdle();
  };
}

// ---------------------------------------------------------------------------
// Vendor auth (business portal)
// ---------------------------------------------------------------------------

export async function signInVendor(email: string, password: string): Promise<
  { ok: true; vendorId: string; vendorName: string } | { ok: false; error: string }
> {
  if (!supabase) return { ok: false, error: 'Backend not configured (demo mode)' };

  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { ok: false, error: error.message };

  const vendor = await getMyVendor();
  if (!vendor) return { ok: false, error: 'No shop is linked to this account yet' };
  return { ok: true, vendorId: vendor.id, vendorName: vendor.name };
}

/** Demo vendor credentials (seeded via supabase/setup_vendor_auth.mjs). */
const DEMO_VENDOR_EMAIL = 'vendor@yememunnai.app';
const DEMO_VENDOR_PASSWORD = 'yememunnai123';
/** Campus PINs accepted at the canteen dashboard keypad (no keyboard needed). */
export const CAMPUS_ACCESS_PINS = ['0708', '1234'];

/**
 * Sign the demo vendor in with the 4-digit campus PIN — designed for the
 * tactile numpad so vendors never touch the on-screen keyboard on mobile.
 */
export async function signInVendorByPin(pin: string): Promise<
  { ok: true; vendorId: string; vendorName: string } | { ok: false; error: string }
> {
  if (!CAMPUS_ACCESS_PINS.includes(pin)) return { ok: false, error: 'Invalid campus PIN — try 0708 or 1234' };
  if (!supabase) {
    return { ok: true, vendorId: 'demo', vendorName: 'MITS Canteen (Demo)' };
  }
  return signInVendor(DEMO_VENDOR_EMAIL, DEMO_VENDOR_PASSWORD);
}

/**
 * ⚡ Instant Demo Access — one tap into the business portal. Signs in the
 * seeded demo vendor account; in demo mode (no Supabase keys) it returns a
 * local session so the dashboard still renders with mock data.
 */
export async function signInDemoVendor(): Promise<
  { ok: true; vendorId: string; vendorName: string } | { ok: false; error: string }
> {
  if (!supabase) {
    return { ok: true, vendorId: 'demo', vendorName: 'MITS Canteen (Demo)' };
  }
  return signInVendor(DEMO_VENDOR_EMAIL, DEMO_VENDOR_PASSWORD);
}

export async function signOutVendor(): Promise<void> {
  if (!supabase) return;
  await supabase.auth.signOut();
}

export async function getMyVendor(): Promise<{ id: string; name: string; isOnline: boolean } | null> {
  if (!supabase) return null;

  const { data: sessionData } = await supabase.auth.getSession();
  if (!sessionData.session) return null;

  const { data, error } = await supabase
    .from('vendors')
    .select('id, name, is_online')
    .eq('owner_id', sessionData.session.user.id)
    .maybeSingle();

  if (error || !data) {
    if (error) console.error('[api] getMyVendor:', error.message);
    return null;
  }
  return { id: data.id, name: data.name, isOnline: data.is_online };
}

export async function setVendorOnline(vendorId: string, isOnline: boolean): Promise<void> {
  // Update in-memory shop
  const shop = inMemoryShops.find(s => s.id === vendorId || s.name.toLowerCase().includes(vendorId.toLowerCase()));
  if (shop) {
    shop.isOnline = isOnline;
  }
  // Sync all food items belonging to this vendor
  inMemoryFoodItems.forEach(i => {
    if (i.vendorId === vendorId || (shop && i.vendor.toLowerCase() === shop.name.toLowerCase())) {
      i.isShopOnline = isOnline;
    }
  });
  notifySubscribers();

  if (supabase) {
    const { error } = await supabase.from('vendors').update({ is_online: isOnline }).eq('id', vendorId);
    if (error) console.error('[api] setVendorOnline:', error.message);
  }
}

// ---------------------------------------------------------------------------
// Menu management (business portal)
// ---------------------------------------------------------------------------

export async function fetchVendorItems(vendorId: string): Promise<FoodItem[]> {
  if (!supabase) {
    return inMemoryFoodItems.filter(i => i.vendorId === vendorId || vendorId === 'demo' || i.vendor === 'MITS Canteen');
  }

  const { data, error } = await supabase
    .from('food_items')
    .select('id, vendor_id, name, price, category, action_type, image_url, in_stock, likes_count, dislikes_count, reviews_count, created_at, vendors(name, is_online), reviews(rating)')
    .eq('vendor_id', vendorId)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('[api] fetchVendorItems:', error.message);
    return inMemoryFoodItems.filter(i => i.vendorId === vendorId || vendorId === 'demo' || i.vendor === 'MITS Canteen');
  }
  return (data as unknown as FoodItemRow[]).map(rowToItem);
}

export async function setItemStock(foodItemId: string, inStock: boolean): Promise<void> {
  // Update in-memory item
  const item = inMemoryFoodItems.find(i => i.id === foodItemId || i.name.toLowerCase() === foodItemId.toLowerCase());
  if (item) {
    item.inStock = inStock;
  }
  notifySubscribers();

  if (supabase) {
    const { error } = await supabase.from('food_items').update({ in_stock: inStock }).eq('id', foodItemId);
    if (error) console.error('[api] setItemStock:', error.message);
  }
}

export async function setVendorAllStock(vendorId: string, inStock: boolean): Promise<void> {
  const shop = inMemoryShops.find(s => s.id === vendorId || s.name.toLowerCase().includes(vendorId.toLowerCase()));
  inMemoryFoodItems.forEach(i => {
    if (i.vendorId === vendorId || (shop && i.vendor.toLowerCase() === shop.name.toLowerCase()) || vendorId === 'demo') {
      i.inStock = inStock;
    }
  });
  notifySubscribers();

  if (supabase) {
    const { error } = await supabase.from('food_items').update({ in_stock: inStock }).eq('vendor_id', vendorId);
    if (error) console.error('[api] setVendorAllStock:', error.message);
  }
}

export async function createFoodItem(vendorId: string, input: NewFoodItemInput): Promise<FoodItem | null> {
  const finalName = input.isVeg === false && !/chicken|mutton|egg|meat|fish|prawn/i.test(input.name)
    ? `${input.name} (Non-Veg)`
    : input.name;

  if (!supabase) {
    const newItem: FoodItem = {
      id: 'item-' + Date.now(),
      vendorId,
      name: finalName,
      vendor: inMemoryShops.find(s => s.id === vendorId)?.name ?? 'MITS Canteen',
      price: input.price,
      category: input.category,
      actionType: input.actionType,
      image: input.imageUrl ?? '/images/item_samosa_chicken.jpg',
      likes: 0,
      dislikes: 0,
      reviews: 0,
      rating: 5.0,
      walkTime: '2 min walk',
      freshnessTag: 'Fresh Batch',
      inStock: input.inStock,
      isVeg: input.isVeg,
      isShopOnline: true
    };
    inMemoryFoodItems.unshift(newItem);
    notifySubscribers();
    return newItem;
  }

  const { data, error } = await supabase
    .from('food_items')
    .insert({
      vendor_id: vendorId,
      name: finalName,
      price: input.price,
      category: input.category,
      action_type: input.actionType,
      in_stock: input.inStock,
      image_url: input.imageUrl
    })
    .select('id, vendor_id, name, price, category, action_type, image_url, in_stock, likes_count, dislikes_count, reviews_count, created_at, vendors(name), reviews(rating)')
    .single();

  if (error) {
    console.error('[api] createFoodItem:', error.message);
    return null;
  }
  return rowToItem(data as unknown as FoodItemRow);
}

/** Uploads to Storage under `<user-id>/<uuid>-<filename>` and returns the public URL. */
export async function uploadFoodPhoto(file: File): Promise<string | null> {
  if (!supabase) return null;

  const { data: sessionData } = await supabase.auth.getSession();
  const userId = sessionData.session?.user.id;
  if (!userId) {
    console.error('[api] uploadFoodPhoto: not signed in');
    return null;
  }

  const ext = file.name.split('.').pop() ?? 'jpg';
  const path = `${userId}/${crypto.randomUUID()}.${ext}`;

  const { error } = await supabase.storage
    .from('food-photos')
    .upload(path, file, { cacheControl: '3600', upsert: false });
  if (error) {
    console.error('[api] uploadFoodPhoto:', error.message);
    return null;
  }

  const { data } = supabase.storage.from('food-photos').getPublicUrl(path);
  return data.publicUrl;
}

// ---------------------------------------------------------------------------
// Dashboard stats (orders today / total likes / avg rating)
// ---------------------------------------------------------------------------

export async function fetchVendorStats(vendorId: string): Promise<VendorStats> {
  if (!supabase) return { ordersToday: 14, totalLikes: 8, avgRating: 4.5 };

  const midnight = new Date();
  midnight.setHours(0, 0, 0, 0);

  const [ordersRes, likesRes, ratingRes] = await Promise.all([
    supabase
      .from('orders')
      .select('id', { count: 'exact', head: true })
      .eq('vendor_id', vendorId)
      .gte('created_at', midnight.toISOString()),
    supabase
      .from('food_items')
      .select('likes_count')
      .eq('vendor_id', vendorId),
    supabase
      .from('reviews')
      .select('rating, food_items!inner(vendor_id)')
      .eq('food_items.vendor_id', vendorId)
  ]);

  if (ordersRes.error) console.error('[api] stats orders:', ordersRes.error.message);
  if (likesRes.error) console.error('[api] stats likes:', likesRes.error.message);
  if (ratingRes.error) console.error('[api] stats rating:', ratingRes.error.message);

  const likes = ((likesRes.data ?? []) as Array<{ likes_count: number }>)
    .reduce((sum, r) => sum + r.likes_count, 0);

  const ratings = ((ratingRes.data ?? []) as Array<{ rating: number }>).map(r => r.rating);
  const avgRating = ratings.length
    ? Math.round((ratings.reduce((a, b) => a + b, 0) / ratings.length) * 10) / 10
    : null;

  return {
    ordersToday: ordersRes.count ?? 0,
    totalLikes: likes,
    avgRating
  };
}

export { isBackendConfigured };
export type { FoodCategory, ActionType };
