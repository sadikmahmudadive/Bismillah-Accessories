"use client";

import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";

import { ButtonLink } from "@/components/ui/button";
import { useCartStore } from "@/lib/store/cart";

const DELIVERY_FEE = 99; // BDT

export function CartDisplay() {
  const { items, itemCount, subtotal, removeItem, updateQuantity } = useCartStore();

  const total = subtotal + (items.length > 0 ? DELIVERY_FEE : 0);

  if (items.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="flex flex-col items-center gap-5 py-16 text-center"
      >
        <div className="grid size-16 place-items-center rounded-full bg-neutral-100 text-neutral-400">
          <ShoppingBag className="size-7" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-neutral-950">Your cart is empty</h2>
          <p className="mt-1 text-sm text-neutral-500">
            Browse the store and add items to get started.
          </p>
        </div>
        <ButtonLink href="/products" showArrow>
          Browse products
        </ButtonLink>
      </motion.div>
    );
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.05 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 16 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.45 } },
    exit: { opacity: 0, x: -20, transition: { duration: 0.3 } },
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_0.42fr] lg:items-start">
      {/* Items list */}
      <div>
        <p className="text-sm font-semibold text-neutral-500">
          {itemCount} {itemCount === 1 ? "item" : "items"}
        </p>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="mt-4 grid gap-3"
        >
          <AnimatePresence mode="popLayout">
            {items.map((item) => (
              <motion.article
                key={`${item.productId}-${item.variantId || "base"}`}
                variants={itemVariants}
                exit="exit"
                layout
                className="grid grid-cols-[5rem_1fr_auto] items-center gap-4 rounded-[1.75rem] border border-neutral-200 bg-white p-3 shadow-sm"
              >
                {/* Image */}
                <div className="relative aspect-square overflow-hidden rounded-2xl bg-[#f6f4ee]">
                  {item.imageUrl ? (
                    <Image
                      src={item.imageUrl}
                      alt={item.name}
                      fill
                      sizes="80px"
                      className="object-cover"
                    />
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-neutral-200 to-neutral-100" />
                  )}
                </div>

                {/* Info */}
                <div className="min-w-0">
                  <h3 className="truncate text-sm font-semibold text-neutral-950">
                    {item.name}
                  </h3>
                  <p className="mt-0.5 text-xs font-medium text-neutral-500">
                    {item.category} {item.variantName ? `· ${item.variantName}` : ""}
                  </p>
                  <p className="mt-1 text-sm font-semibold text-neutral-800">
                    ৳{(item.price * item.quantity).toLocaleString("en-BD")}
                  </p>
                </div>

                {/* Controls */}
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1 rounded-full border border-neutral-200 bg-[#f6f4ee] p-1">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      type="button"
                      aria-label="Decrease quantity"
                      onClick={() => updateQuantity(item.productId, item.variantId, item.quantity - 1)}
                      className="grid size-7 place-items-center rounded-full transition hover:bg-white"
                    >
                      <Minus className="size-3.5 text-neutral-600" />
                    </motion.button>
                    <span className="w-6 text-center text-sm font-semibold text-neutral-950">
                      {item.quantity}
                    </span>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      type="button"
                      aria-label="Increase quantity"
                      onClick={() => updateQuantity(item.productId, item.variantId, item.quantity + 1)}
                      className="grid size-7 place-items-center rounded-full transition hover:bg-white"
                    >
                      <Plus className="size-3.5 text-neutral-600" />
                    </motion.button>
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    type="button"
                    aria-label={`Remove ${item.name}`}
                    onClick={() => removeItem(item.productId, item.variantId)}
                    className="grid size-9 place-items-center rounded-full border border-neutral-200 bg-white text-neutral-400 transition hover:border-[#d65f5f]/30 hover:bg-[#d65f5f]/10 hover:text-[#d65f5f]"
                  >
                    <Trash2 className="size-4" />
                  </motion.button>
                </div>
              </motion.article>
            ))}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Order summary */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.15 }}
        className="rounded-[1.75rem] border border-neutral-200 bg-white p-5 shadow-sm lg:sticky lg:top-24"
      >
        <h2 className="text-lg font-semibold text-neutral-950">Order summary</h2>

        <div className="mt-5 grid gap-3 text-sm text-neutral-700">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span className="font-semibold">৳{subtotal.toLocaleString("en-BD")}</span>
          </div>
          <div className="flex justify-between">
            <span>Delivery fee</span>
            <span className="font-semibold">৳{DELIVERY_FEE}</span>
          </div>
          <div className="my-1 h-px bg-neutral-100" />
          <div className="flex justify-between text-base font-semibold text-neutral-950">
            <span>Total</span>
            <span>৳{total.toLocaleString("en-BD")}</span>
          </div>
        </div>

        <div className="mt-5 grid gap-3">
          <ButtonLink href="/checkout" className="w-full">
            Proceed to checkout
          </ButtonLink>
          <ButtonLink href="/products" variant="secondary" className="w-full">
            Continue shopping
          </ButtonLink>
        </div>
      </motion.div>
    </div>
  );
}
