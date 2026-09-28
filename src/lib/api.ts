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

/** Stable per-browser visitor key, e.g. "anon:9f3c…" (consumers have no account). */
export function getUserKey(): string {
  const KEY = 'yememunnai_user_key';
  let key = localStorage.getItem(KEY);
  if (!key) {
    key = `anon:${crypto.randomUUID()}`;
    localStorage.setItem(KEY, key);
  }
  return key;
}

function rowToItem(row: FoodItemRow): FoodItem {
  const ratings = (row.reviews ?? []).map(r => r.rating);
  const avg = ratings.length
    ? Math.round((ratings.reduce((a, b) => a + b, 0) / ratings.length) * 10) / 10
    : 4.5;
  const vendorInfo = row.vendors;
  const walkTime = vendorInfo?.is_on_campus === false
    ? '8 min walk'
    : (vendorInfo?.name.toLowerCase().includes('canteen') ? '2 min walk' : '4 min walk');

  return {
    id: row.id,
    vendorId: row.vendor_id,
    name: row.name,
    vendor: vendorInfo?.name ?? 'Unknown shop',
    price: row.price,
    category: row.category,
    image: row.image_url ?? '/images/samosa.jpg',
    likes: row.likes_count,
    dislikes: row.dislikes_count,
    reviews: row.reviews_count,
    rating: avg,
    walkTime,
    actionType: row.action_type,
    inStock: row.in_stock,
    latitude: vendorInfo?.latitude ?? undefined,
    longitude: vendorInfo?.longitude ?? undefined,
    locationLandmark: vendorInfo?.location_landmark ?? undefined,
    isOnCampus: vendorInfo?.is_on_campus ?? true
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
    image: row.food_items?.image_url ?? '/images/samosa.jpg',
    status: row.status
  };
}

// ---------------------------------------------------------------------------
// Discovery (consumer home)
// ---------------------------------------------------------------------------

export async function fetchFoodItems(category?: FoodCategory): Promise<FoodItem[]> {
  if (!supabase) return DEFAULT_FOOD_ITEMS;

  let query = supabase
    .from('food_items')
    .select('id, vendor_id, name, price, category, action_type, image_url, in_stock, likes_count, dislikes_count, reviews_count, created_at, vendors(name, latitude, longitude, location_landmark, is_on_campus), reviews(rating)')
    .eq('in_stock', true)
    .order('created_at', { ascending: true });

  if (category) query = query.eq('category', category);

  const { data, error } = await query;
  if (error) {
    console.error('[api] fetchFoodItems:', error.message);
    return DEFAULT_FOOD_ITEMS;
  }
  return (data as unknown as FoodItemRow[]).map(rowToItem);
}

export async function fetchShops(): Promise<ShopEntry[]> {
  if (!supabase) return LOCAL_SHOPS;

  const { data, error } = await supabase
    .from('vendors')
    .select('id, name, image_url, is_active, latitude, longitude, location_landmark, is_on_campus')
    .order('is_active', { ascending: false });

  if (error) {
    console.error('[api] fetchShops:', error.message);
    return LOCAL_SHOPS;
  }
  return (data as Array<{ id: string; name: string; image_url: string | null; is_active: boolean; latitude?: number | null; longitude?: number | null; location_landmark?: string | null; is_on_campus?: boolean | null }>).map(v => ({
    id: v.id,
    name: v.name,
    image: v.image_url ?? '/images/shop_canteen.jpg',
    isActive: v.is_active,
    latitude: v.latitude ?? undefined,
    longitude: v.longitude ?? undefined,
    locationLandmark: v.location_landmark ?? undefined,
    isOnCampus: v.is_on_campus ?? true,
    tag: v.is_on_campus === false ? 'Off-campus' : (v.name.toLowerCase().includes('canteen') ? '160m walk' : '320m walk')
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
}): Promise<{ success: boolean; token?: string }> {
  const clientOrderId = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : undefined;
  const numPart = (clientOrderId || `${Date.now()}`).replace(/\D/g, '');
  const token = numPart.length >= 3 ? numPart.slice(-3) : Math.floor(100 + Math.random() * 900).toString();

  if (!supabase) {
    return { success: true, token };
  }

  const payload: Record<string, unknown> = {
    vendor_id: input.foodItem.vendorId,
    food_item_id: input.foodItem.id,
    item_name: input.foodItem.name,
    unit_price: input.foodItem.price,
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

  return { success: true, token };
}

/**
 * Live order feed for one vendor. `onData` is invoked on every change
 * (initial load + realtime inserts/updates). Returns an unsubscribe fn,
 * or a no-op when in demo mode.
 */
export function subscribeVendorOrders(
  vendorId: string,
  onData: (orders: DashboardOrder[]) => void
): () => void {
  if (!supabase) return () => {};

  const mapRows = (rows: OrderRow[]) => rows.map(r => orderRowToDashboard(r, 'Your Shop'));

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

  void load();

  const channel = supabase
    .channel(`vendor-orders-${vendorId}`)
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'orders', filter: `vendor_id=eq.${vendorId}` },
      () => void load()
    )
    .subscribe();

  return () => {
    void supabase!.removeChannel(channel);
  };
}

export async function setOrderStatus(orderId: string, status: OrderStatus): Promise<void> {
  if (!supabase) return;
  const { error } = await supabase.from('orders').update({ status }).eq('id', orderId);
  if (error) console.error('[api] setOrderStatus:', error.message);
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
  if (!supabase) return;
  const { error } = await supabase.from('vendors').update({ is_online: isOnline }).eq('id', vendorId);
  if (error) console.error('[api] setVendorOnline:', error.message);
}

// ---------------------------------------------------------------------------
// Menu management (business portal)
// ---------------------------------------------------------------------------

export async function fetchVendorItems(vendorId: string): Promise<FoodItem[]> {
  if (!supabase) {
    return DEFAULT_FOOD_ITEMS.filter(i => i.vendorId === vendorId || vendorId === 'demo');
  }

  const { data, error } = await supabase
    .from('food_items')
    .select('id, vendor_id, name, price, category, action_type, image_url, in_stock, likes_count, dislikes_count, reviews_count, created_at, vendors(name), reviews(rating)')
    .eq('vendor_id', vendorId)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('[api] fetchVendorItems:', error.message);
    return [];
  }
  return (data as unknown as FoodItemRow[]).map(rowToItem);
}

export async function setItemStock(foodItemId: string, inStock: boolean): Promise<void> {
  if (!supabase) return;
  const { error } = await supabase.from('food_items').update({ in_stock: inStock }).eq('id', foodItemId);
  if (error) console.error('[api] setItemStock:', error.message);
}

export async function createFoodItem(vendorId: string, input: NewFoodItemInput): Promise<FoodItem | null> {
  if (!supabase) return null;

  const { data, error } = await supabase
    .from('food_items')
    .insert({
      vendor_id: vendorId,
      name: input.name,
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
