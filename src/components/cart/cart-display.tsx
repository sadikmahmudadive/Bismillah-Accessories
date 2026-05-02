"use client";

import { motion } from "framer-motion";
import { Trash2, Plus, Minus } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useCartStore } from "@/lib/store/cart";
import { Button } from "@/components/ui/button";

export function CartDisplay() {
  const { items, itemCount, subtotal, removeItem, updateQuantity } =
    useCartStore();

  const DELIVERY_FEE = 99; // BDT
  const total = subtotal + (items.length > 0 ? DELIVERY_FEE : 0);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  if (items.length === 0) {
    return (
      <motion.div
        variants={itemVariants}
        initial="hidden"
        animate="visible"
        className="text-center py-12"
      >
        <p className="text-gray-500 dark:text-gray-400 mb-4">
          Your cart is empty
        </p>
        <Link href="/products">
          <Button>Continue Shopping</Button>
        </Link>
      </motion.div>
    );
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Cart Items */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          Order Summary ({itemCount} {itemCount === 1 ? "item" : "items"})
        </h2>

        <div className="space-y-3">
          {items.map((item) => (
            <motion.div
              key={item.productId}
              variants={itemVariants}
              className="flex items-center gap-4 p-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900"
            >
              {/* Product Image */}
              <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800 flex-shrink-0">
                <Image
                  src={item.imageUrl}
                  alt={item.name}
                  fill
                  className="object-cover"
                  sizes="80px"
                />
              </div>

              {/* Product Info */}
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                  {item.name}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  ৳{item.price.toFixed(0)} each
                </p>
              </div>

              {/* Quantity Controls */}
              <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 rounded-lg p-2">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                  className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
                >
                  <Minus className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                </motion.button>

                <span className="w-8 text-center font-semibold text-gray-900 dark:text-white">
                  {item.quantity}
                </span>

                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                  className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
                >
                  <Plus className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                </motion.button>
              </div>

              {/* Item Total */}
              <div className="text-right">
                <p className="font-semibold text-gray-900 dark:text-white">
                  ৳{(item.price * item.quantity).toFixed(0)}
                </p>
              </div>

              {/* Remove Button */}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => removeItem(item.productId)}
                className="p-2 hover:bg-red-100 dark:hover:bg-red-900/20 rounded-lg text-red-600 dark:text-red-400"
              >
                <Trash2 className="w-5 h-5" />
              </motion.button>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Order Summary */}
      <motion.div
        variants={itemVariants}
        className="p-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900"
      >
        <div className="space-y-3">
          <div className="flex justify-between text-gray-700 dark:text-gray-300">
            <span>Subtotal</span>
            <span>৳{subtotal.toFixed(0)}</span>
          </div>
          <div className="flex justify-between text-gray-700 dark:text-gray-300">
            <span>Delivery Fee</span>
            <span>৳{items.length > 0 ? DELIVERY_FEE : 0}</span>
          </div>
          <div className="border-t border-gray-200 dark:border-gray-700 pt-3 flex justify-between font-semibold text-lg text-gray-900 dark:text-white">
            <span>Total</span>
            <span>৳{total.toFixed(0)}</span>
          </div>
        </div>
      </motion.div>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <Link href="/products" className="flex-1">
          <Button variant="secondary">Continue Shopping</Button>
        </Link>
        <Link href="/checkout" className="flex-1">
          <Button>Proceed to Checkout</Button>
        </Link>
      </div>
    </motion.div>
  );
}
