import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Product } from "@/types/domain";

type FavoritesState = {
  items: Product[];
  addItem: (product: Product) => void;
  removeItem: (productId: string) => void;
  hasItem: (productId: string) => boolean;
  itemCount: number;
};

export const useFavoritesStore = create<FavoritesState>()(
  persist(
    (set, get) => ({
      items: [],
      itemCount: 0,
      addItem: (product) => {
        const { items } = get();
        if (!items.find((i) => i.id === product.id)) {
          set({ items: [...items, product], itemCount: items.length + 1 });
        }
      },
      removeItem: (productId) => {
        const { items } = get();
        const newItems = items.filter((i) => i.id !== productId);
        set({ items: newItems, itemCount: newItems.length });
      },
      hasItem: (productId) => {
        return get().items.some((i) => i.id === productId);
      },
    }),
    {
      name: "ba-favorites-storage",
    }
  )
);
