import { useCallback, useEffect, useRef, useState } from 'react';
import {
  fetchFoodItems,
  fetchShops,
  fetchMyReactions,
  setReaction,
  signInVendor,
  signOutVendor,
  getMyVendor,
  subscribeVendorOrders,
  fetchVendorStats
} from './api';
import { DEFAULT_FOOD_ITEMS, LOCAL_SHOPS } from './mockData';
import type { FoodCategory, FoodItem, ShopEntry, DashboardOrder, VendorStats } from './types';

// ---------------------------------------------------------------------------
// Consumer discovery
// ---------------------------------------------------------------------------

/** Live food items for the discovery grid. Falls back to mock data in demo mode. */
export function useFoodItems(category: FoodCategory): { items: FoodItem[]; loading: boolean } {
  const [items, setItems] = useState<FoodItem[]>(() =>
    DEFAULT_FOOD_ITEMS.filter(i => i.category === category)
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    fetchFoodItems(category)
      .then(list => {
        if (!cancelled) setItems(list.filter(i => i.category === category));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [category]);

  return { items, loading };
}

/** Shop avatars for the "Local Shops" row. */
export function useShops(): ShopEntry[] {
  const [shops, setShops] = useState<ShopEntry[]>(LOCAL_SHOPS);

  useEffect(() => {
    let cancelled = false;
    fetchShops().then(list => {
      if (!cancelled) setShops(list);
    });
    return () => {
      cancelled = true;
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
      const next = prev;
      for (const item of items) {
        if (!(item.id in prev)) {
          next[item.id] = { likes: item.likes, dislikes: item.dislikes };
        }
      }
      return { ...next };
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

      // Persist
      void setReaction(itemId, value).then(() => {
        // Reconcile counts from server after the write settles
        void fetchFoodItems().then(list => {
          setCounts(prev => {
            const next = { ...prev };
            for (const item of list) {
              if (next[item.id]) {
                next[item.id] = { likes: item.likes, dislikes: item.dislikes };
              }
            }
            return next;
          });
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

/** Vendor login state; auto-restores the session on page load. */
export function useVendorSession(): {
  vendor: VendorSession | null;
  checking: boolean;
  signIn: (email: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  signOut: () => Promise<void>;
} {
  const [vendor, setVendor] = useState<VendorSession | null>(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    let cancelled = false;
    getMyVendor().then(v => {
      if (!cancelled) {
        if (v) setVendor({ vendorId: v.id, vendorName: v.name });
        setChecking(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    const res = await signInVendor(email, password);
    if (res.ok) setVendor({ vendorId: res.vendorId, vendorName: res.vendorName });
    return res.ok ? { ok: true } : { ok: false, error: res.error };
  }, []);

  const signOut = useCallback(async () => {
    await signOutVendor();
    setVendor(null);
  }, []);

  return { vendor, checking, signIn, signOut };
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
