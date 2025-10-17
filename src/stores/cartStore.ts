import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { SlideWithTeacher } from "src/types/slide/slide";

interface CartItem extends SlideWithTeacher {
  selected: boolean;
}

interface CartStore {
  items: CartItem[];
  addToCart: (item: SlideWithTeacher) => void;
  removeFromCart: (itemId: number) => void;
  clearCart: () => void;
  toggleItemSelection: (itemId: number) => void;
  selectAllItems: () => void;
  deselectAllItems: () => void;
  getSelectedItems: () => SlideWithTeacher[];
  getTotalPrice: () => number;
}

export const useCart = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      addToCart: (item) => set((state) => {
        // Check if item already exists
        const existingItem = state.items.find(existing => existing.id === item.id);
        if (existingItem) {
          return state; // Don't add duplicate
        }
        return { 
          items: [...state.items, { ...item, selected: true }] 
        };
      }),
      removeFromCart: (itemId) =>
        set((state) => ({
          items: state.items.filter((item) => item.id !== itemId),
        })),
      clearCart: () => set({ items: [] }),
      toggleItemSelection: (itemId) =>
        set((state) => ({
          items: state.items.map((item) =>
            item.id === itemId ? { ...item, selected: !item.selected } : item
          ),
        })),
      selectAllItems: () =>
        set((state) => ({
          items: state.items.map((item) => ({ ...item, selected: true })),
        })),
      deselectAllItems: () =>
        set((state) => ({
          items: state.items.map((item) => ({ ...item, selected: false })),
        })),
      getSelectedItems: () => {
        const state = get();
        return state.items
          .filter((item) => item.selected)
          .map(({ selected, ...item }) => item);
      },
      getTotalPrice: () => {
        const state = get();
        return state.items
          .filter((item) => item.selected)
          .reduce((total, item) => total + item.price, 0);
      },
    }),
    { name: "cart" },
  ),
);