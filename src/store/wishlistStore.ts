import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface WishlistStore {
  items: string[]; // array of product IDs
  isOpen: boolean;
  toggleItem: (productId: string) => void;
  hasItem: (productId: string) => boolean;
  setIsOpen: (isOpen: boolean) => void;
}

export const useWishlistStore = create<WishlistStore>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      toggleItem: (productId) => {
        const items = get().items;
        if (items.includes(productId)) {
          set({ items: items.filter((id) => id !== productId) });
        } else {
          set({ items: [...items, productId] });
        }
      },
      hasItem: (productId) => get().items.includes(productId),
      setIsOpen: (isOpen) => set({ isOpen }),
    }),
    {
      name: 'mystore-wishlist',
      partialize: (state) => ({ items: state.items }), // Only persist items, not isOpen
    }
  )
);
