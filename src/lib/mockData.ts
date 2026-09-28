import type { FoodItem, ShopEntry } from './types';

/** Used when Supabase credentials are not configured (demo mode). */
export const DEFAULT_FOOD_ITEMS: FoodItem[] = [
  {
    id: 'samosa-1',
    vendorId: 'a0000000-0000-4000-8000-000000000001',
    name: 'Crispy Veg Samosa (2 pcs)',
    vendor: 'MITS Main Canteen',
    price: 20,
    originalPrice: 25,
    category: 'cooked',
    image: '/images/samosa.jpg',
    likes: 48,
    dislikes: 2,
    reviews: 14,
    rating: 4.9,
    freshnessTag: 'Fresh Batch Out',
    stockLeft: 22,
    walkTime: '2 min walk',
    actionType: 'walkin',
    inStock: true
  },
  {
    id: 'biryani-1',
    vendorId: 'a0000000-0000-4000-8000-000000000002',
    name: 'Hyderabadi Chicken Dum Biryani',
    vendor: 'Royal Corner',
    price: 140,
    originalPrice: 160,
    category: 'cooked',
    image: '/images/biryani.jpg',
    likes: 96,
    dislikes: 1,
    reviews: 32,
    rating: 4.8,
    freshnessTag: 'Pot #2 Steaming',
    stockLeft: 12,
    walkTime: '4 min walk',
    actionType: 'order',
    inStock: true
  },
  {
    id: 'lays-1',
    vendorId: 'a0000000-0000-4000-8000-000000000001',
    name: 'Crispy Salted Potato Chips',
    vendor: 'MITS Main Canteen',
    price: 20,
    category: 'packed',
    image: '/images/chips_bowl.jpg',
    likes: 38,
    dislikes: 3,
    reviews: 8,
    rating: 4.6,
    freshnessTag: 'Fresh Stock',
    stockLeft: 15,
    walkTime: '2 min walk',
    actionType: 'walkin',
    inStock: true
  },
  {
    id: 'lays-2',
    vendorId: 'a0000000-0000-4000-8000-000000000005',
    name: "Lay's Classic Salted",
    vendor: 'Lays Corner',
    price: 20,
    category: 'packed',
    image: '/images/lays_packet.jpg',
    likes: 104,
    dislikes: 2,
    reviews: 19,
    rating: 4.9,
    freshnessTag: 'Sealed Fresh',
    stockLeft: 28,
    walkTime: '3 min walk',
    actionType: 'order',
    inStock: true
  }
];

export const LOCAL_SHOPS: ShopEntry[] = [
  { id: '1', name: 'MITS Canteen', image: '/images/shop_canteen.jpg', isActive: true, tag: 'Open • 160m' },
  { id: '2', name: 'Royal Hotel', image: '/images/shop_royal.jpg', isActive: false, tag: 'Open • 320m' },
  { id: '3', name: 'Chai Corner', image: '/images/shop_chai.jpg', isActive: false, tag: 'Open • 210m' },
  { id: '4', name: 'Vatika Tuck', image: '/images/shop_yat.jpg', isActive: false, tag: 'Break • 400m' }
];
