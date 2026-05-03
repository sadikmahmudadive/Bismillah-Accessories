import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CartItem, Cart } from "@/types/domain";

interface CartStore extends Cart {
  addItem: (item: Omit<CartItem, "quantity">, quantity?: number) => void;
  removeItem: (productId: string, variantId?: string) => void;
  updateQuantity: (productId: string, variantId: string | undefined, quantity: number) => void;
  clearCart: () => void;
  getItemCount: () => number;
  getSubtotal: () => number;
}

const INITIAL_STATE: Cart = {
  items: [],
  itemCount: 0,
  subtotal: 0,
  lastUpdated: Date.now(),
};

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      ...INITIAL_STATE,

      addItem: (item, quantity = 1) => {
        set((state) => {
          const existingItem = state.items.find(
            (i) => i.productId === item.productId && i.variantId === item.variantId
          );

          let updatedItems: CartItem[];

          if (existingItem) {
            // Update quantity if item already exists
            updatedItems = state.items.map((i) =>
              i.productId === item.productId && i.variantId === item.variantId
                ? { ...i, quantity: i.quantity + quantity }
                : i
            );
          } else {
            // Add new item
            updatedItems = [...state.items, { ...item, quantity }];
          }

          const subtotal = updatedItems.reduce(
            (sum, item) => sum + item.price * item.quantity,
            0
          );

          return {
            items: updatedItems,
            itemCount: updatedItems.reduce((sum, i) => sum + i.quantity, 0),
            subtotal,
            lastUpdated: Date.now(),
          };
        });
      },

      removeItem: (productId: string, variantId?: string) => {
        set((state) => {
          const updatedItems = state.items.filter(
            (i) => !(i.productId === productId && i.variantId === variantId)
          );
          const subtotal = updatedItems.reduce(
            (sum, item) => sum + item.price * item.quantity,
            0
          );

          return {
            items: updatedItems,
            itemCount: updatedItems.reduce((sum, i) => sum + i.quantity, 0),
            subtotal,
            lastUpdated: Date.now(),
          };
        });
      },

      updateQuantity: (productId: string, variantId: string | undefined, quantity: number) => {
        set((state) => {
          if (quantity <= 0) {
            // Remove item if quantity is 0 or less
            return get().removeItem(productId, variantId) as unknown as Cart;
          }

          const updatedItems = state.items.map((i) =>
            i.productId === productId && i.variantId === variantId ? { ...i, quantity } : i
          );

          const subtotal = updatedItems.reduce(
            (sum, item) => sum + item.price * item.quantity,
            0
          );

          return {
            items: updatedItems,
            itemCount: updatedItems.reduce((sum, i) => sum + i.quantity, 0),
            subtotal,
            lastUpdated: Date.now(),
          };
        });
      },

      clearCart: () => {
        set({
          items: [],
          itemCount: 0,
          subtotal: 0,
          lastUpdated: Date.now(),
        });
      },

      getItemCount: () => get().itemCount,

      getSubtotal: () => get().subtotal,
    }),
    {
      name: "bismillah-cart", // localStorage key
      version: 1,
      // Persist only items and lastUpdated, recalculate derived values on load
      partialize: (state) => ({
        items: state.items,
        lastUpdated: state.lastUpdated,
      }),
      onRehydrateStorage: () => (state) => {
        // Recalculate derived values after hydration
        if (state) {
          const itemCount = state.items.reduce((sum, i) => sum + i.quantity, 0);
          const subtotal = state.items.reduce(
            (sum, item) => sum + item.price * item.quantity,
            0
          );
          state.itemCount = itemCount;
          state.subtotal = subtotal;
        }
      },
    }
  )
);
