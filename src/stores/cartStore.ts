import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { SlideWithTeacher } from "src/types/slide/slide";

interface CartStore {
  items: SlideWithTeacher[];
  addToCart: (item: SlideWithTeacher) => void;
  removeFromCart: (itemId: number) => void;
  clearCart: () => void;
}

export const useCart = create<CartStore>()(
  persist(
    (set) => ({
      items: [],
      addToCart: (item) => set((state) => ({ items: [...state.items, item] })),
      removeFromCart: (itemId) =>
        set((state) => ({
          items: state.items.filter((item) => item.id !== itemId),
        })),
      clearCart: () => set({ items: [] }),
    }),
    { name: "cart" },
  ),
);