import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  fetchFoodItems,
  fetchShops,
  fetchMyReactions,
  setReaction,
  fetchItemReactionCounts,
  signInVendor,
  signInVendorByPin,
  signInDemoVendor,
  signOutVendor,
  getMyVendor,
  subscribeVendorOrders,
  fetchVendorStats,
  subscribeCatalogUpdates
} from './api';
import { DEFAULT_FOOD_ITEMS, LOCAL_SHOPS } from './mockData';
import type { FoodCategory, FoodItem, ShopEntry, DashboardOrder, VendorStats } from './types';

// ---------------------------------------------------------------------------
// Consumer discovery
// ---------------------------------------------------------------------------

/**
 * Live food items for the discovery grid. Fetches the full list
 * and filters client-side, while subscribing to realtime catalog updates.
 */
export function useFoodItems(category: FoodCategory): {
  items: FoodItem[];
  loading: boolean;
  totalByCategory: Record<FoodCategory, number>;
} {
  const [allItems, setAllItems] = useState<FoodItem[]>(DEFAULT_FOOD_ITEMS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const reload = () => {
      fetchFoodItems()
        .then(list => {
          if (!cancelled && list.length > 0) setAllItems(list);
        })
        .finally(() => {
          if (!cancelled) setLoading(false);
        });
    };

    reload();
    const unsub = subscribeCatalogUpdates(reload);

    return () => {
      cancelled = true;
      unsub();
    };
  }, []);

  const items = useMemo(
    () => allItems.filter(i => i.category === category),
    [allItems, category]
  );

  const totalByCategory = useMemo(() => {
    const counts = { cooked: 0, packed: 0 } as Record<FoodCategory, number>;
    for (const item of allItems) counts[item.category] = (counts[item.category] ?? 0) + 1;
    return counts;
  }, [allItems]);

  return { items, loading, totalByCategory };
}

/** Shop avatars for the "Local Shops" row. Subscribes to realtime catalog updates. */
export function useShops(): ShopEntry[] {
  const [shops, setShops] = useState<ShopEntry[]>(LOCAL_SHOPS);

  useEffect(() => {
    let cancelled = false;

    const reload = () => {
      fetchShops().then(list => {
        if (!cancelled && list.length > 0) setShops(list);
      });
    };

    reload();
    const unsub = subscribeCatalogUpdates(reload);

    return () => {
      cancelled = true;
      unsub();
    };
  }, []);

  return shops;
}

/**
 * Like/dislike state for this visitor with optimistic local updates,
 * reconciled against the server (`reactions` table).
 */
export function useReactions(items: FoodItem[]) {
  const [myReactions, setMyReactions] = useState<Record<string, 'like' | 'dislike'>>({});
  const [counts, setCounts] = useState<Record<string, { likes: number; dislikes: number }>>({});

  useEffect(() => {
    let cancelled = false;
    fetchMyReactions().then(map => {
      if (!cancelled) setMyReactions(map);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    setCounts(prev => {
      const next = { ...prev };
      for (const item of items) {
        if (!(item.id in prev)) {
          next[item.id] = { likes: item.likes, dislikes: item.dislikes };
        }
      }
      return next;
    });
  }, [items]);

  const toggle = useCallback(
    (itemId: string, value: 'like' | 'dislike') => {
      const opposite = value === 'like' ? 'dislike' : 'like';
      const current = myReactions[itemId];

      // Optimistic count updates
      setCounts(prev => {
        const c = prev[itemId] ?? { likes: 0, dislikes: 0 };
        let { likes, dislikes } = c;
        if (current === value) {
          // undo
          if (value === 'like') likes = Math.max(0, likes - 1);
          else dislikes = Math.max(0, dislikes - 1);
        } else if (current === opposite) {
          // switch
          if (value === 'like') {
            likes += 1;
            dislikes = Math.max(0, dislikes - 1);
          } else {
            dislikes += 1;
            likes = Math.max(0, likes - 1);
          }
        } else {
          // first reaction
          if (value === 'like') likes += 1;
          else dislikes += 1;
        }
        return { ...prev, [itemId]: { likes, dislikes } };
      });

      // Optimistic reaction state
      setMyReactions(prev => {
        const next = { ...prev };
        if (current === value) delete next[itemId];
        else next[itemId] = value;
        return next;
      });

      // Persist without refetching the entire catalog (Scale P0 fix)
      void setReaction(itemId, value).then(() => {
        void fetchItemReactionCounts(itemId).then(counts => {
          if (counts) {
            setCounts(prev => ({
              ...prev,
              [itemId]: counts
            }));
          }
        });
      });
    },
    [myReactions]
  );

  const toggleLike = useCallback((id: string) => toggle(id, 'like'), [toggle]);
  const toggleDislike = useCallback((id: string) => toggle(id, 'dislike'), [toggle]);

  return { myReactions, counts, toggleLike, toggleDislike };
}

// ---------------------------------------------------------------------------
// Business portal
// ---------------------------------------------------------------------------

export interface VendorSession {
  vendorId: string;
  vendorName: string;
}

// ---------------------------------------------------------------------------
// Shared vendor session store
// ---------------------------------------------------------------------------
// VendorLoginModal and BusinessDashboardScreen each call useVendorSession(),
// so the session must live OUTSIDE React state — otherwise a sign-in in the
// modal never flips the dashboard's login gate (two isolated copies).

let sharedVendor: VendorSession | null = null;
const vendorListeners = new Set<(v: VendorSession | null) => void>();

function publishVendor(next: VendorSession | null) {
  sharedVendor = next;
  for (const listener of vendorListeners) listener(next);
}

/** Vendor login state; auto-restores the session on page load. Shared across all callers. */
export function useVendorSession(): {
  vendor: VendorSession | null;
  checking: boolean;
  signIn: (email: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  signInWithPin: (pin: string) => Promise<{ ok: boolean; error?: string }>;
  signInDemo: () => Promise<{ ok: boolean; error?: string }>;
  signOut: () => Promise<void>;
} {
  const [vendor, setVendor] = useState<VendorSession | null>(sharedVendor);
  const [checking, setChecking] = useState(() => sharedVendor === null);

  useEffect(() => {
    const listener = (v: VendorSession | null) => setVendor(v);
    vendorListeners.add(listener);
    setVendor(sharedVendor);

    if (sharedVendor !== null) {
      // Another component (e.g. the login modal) already established a session.
      setChecking(false);
      return () => vendorListeners.delete(listener);
    }

    let cancelled = false;
    getMyVendor().then(v => {
      if (!cancelled) {
        if (v) publishVendor({ vendorId: v.id, vendorName: v.name });
        setChecking(false);
      }
    });
    return () => {
      cancelled = true;
      vendorListeners.delete(listener);
    };
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    const res = await signInVendor(email, password);
    if (res.ok) publishVendor({ vendorId: res.vendorId, vendorName: res.vendorName });
    return res.ok ? { ok: true } : { ok: false, error: res.error };
  }, []);

  const signInWithPin = useCallback(async (pin: string) => {
    const res = await signInVendorByPin(pin);
    if (res.ok) publishVendor({ vendorId: res.vendorId, vendorName: res.vendorName });
    return res.ok ? { ok: true } : { ok: false, error: res.error };
  }, []);

  const signInDemo = useCallback(async () => {
    const res = await signInDemoVendor();
    if (res.ok) publishVendor({ vendorId: res.vendorId, vendorName: res.vendorName });
    return res.ok ? { ok: true } : { ok: false, error: res.error };
  }, []);

  const signOut = useCallback(async () => {
    await signOutVendor();
    publishVendor(null);
  }, []);

  return { vendor, checking, signIn, signInWithPin, signInDemo, signOut };
}

/** Realtime incoming-order feed for the signed-in vendor. */
export function useVendorOrders(vendorId: string | null): {
  orders: DashboardOrder[];
  loading: boolean;
} {
  const [orders, setOrders] = useState<DashboardOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const firstLoad = useRef(true);

  useEffect(() => {
    if (!vendorId) {
      setOrders([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    firstLoad.current = true;

    const unsubscribe = subscribeVendorOrders(vendorId, list => {
      setOrders(list);
      if (firstLoad.current) {
        firstLoad.current = false;
        setLoading(false);
      }
    });

    return unsubscribe;
  }, [vendorId]);

  return { orders, loading };
}

/** Live stats cards for the signed-in vendor (demo values when unconfigured). */
export function useVendorStats(vendorId: string | null): VendorStats {
  const [stats, setStats] = useState<VendorStats>(
    vendorId ? { ordersToday: 0, totalLikes: 0, avgRating: null } : { ordersToday: 14, totalLikes: 8, avgRating: 4.5 }
  );

  useEffect(() => {
    if (!vendorId) return; // keep demo values
    let cancelled = false;
    fetchVendorStats(vendorId).then(s => {
      if (!cancelled) setStats(s);
    });
    return () => {
      cancelled = true;
    };
  }, [vendorId]);

  return stats;
}
