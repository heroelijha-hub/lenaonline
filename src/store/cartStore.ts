import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
  id: string; // product id + variation id for uniqueness
  productId: string;
  variationId?: string;
  title: string;
  price: number;
  image: string;
  quantity: number;
  attributes?: Record<string, string>; // e.g. { Couleur: "Rouge", Taille: "M" }
  forcedByItemId?: string; // id of the item that forces this product
}

interface CartStore {
  items: CartItem[];
  addItem: (item: CartItem, forceSalesItems?: CartItem[]) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  coupon: { code: string; type: 'PERCENTAGE' | 'FIXED_AMOUNT'; value: number } | null;
  setCoupon: (coupon: { code: string; type: 'PERCENTAGE' | 'FIXED_AMOUNT'; value: number } | null) => void;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      isOpen: false,
      setIsOpen: (isOpen) => set({ isOpen }),
      coupon: null,
      setCoupon: (coupon) => set({ coupon }),
      items: [],
      addItem: (item, forceSalesItems = []) => {
        const currentItems = get().items;
        const newItems = [...currentItems];

        const addItemLogic = (itemToAdd: CartItem) => {
          const existingIdx = newItems.findIndex((i) => i.id === itemToAdd.id);
          if (existingIdx !== -1) {
            newItems[existingIdx] = { 
              ...newItems[existingIdx], 
              quantity: newItems[existingIdx].quantity + itemToAdd.quantity 
            };
          } else {
            newItems.push(itemToAdd);
          }
        };

        addItemLogic(item);
        forceSalesItems.forEach(fsItem => {
          // ensure forcedByItemId is set to main item id
          addItemLogic({ ...fsItem, forcedByItemId: item.id });
        });

        set({ items: newItems });
      },
      removeItem: (id) =>
        set((state) => ({ 
          // Retirer l'item et aussi tous les items qui étaient forcés par celui-ci
          items: state.items.filter((i) => i.id !== id && i.forcedByItemId !== id) 
        })),
      updateQuantity: (id, quantity) =>
        set((state) => ({
          items: state.items.map((i) =>
            i.id === id ? { ...i, quantity: Math.max(1, quantity) } : i
          ),
        })),
      clearCart: () => set({ items: [] }),
      getTotalItems: () => get().items.reduce((total, item) => total + item.quantity, 0),
      getTotalPrice: () => get().items.reduce((total, item) => total + item.price * item.quantity, 0),
    }),
    {
      name: 'mystore-cart',
      partialize: (state) => ({ items: state.items, coupon: state.coupon }),
    }
  )
);
