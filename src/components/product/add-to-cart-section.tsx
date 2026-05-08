"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Check, Loader2, ShoppingBag, Zap } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { useCartStore } from "@/lib/store/cart";
import { FavoriteButton } from "@/components/product/favorite-button";
import type { Product, ProductVariant } from "@/types/domain";
import { cn } from "@/lib/utils";

export function AddToCartSection({ product }: { product: Product }) {
  const router = useRouter();
  const addItem = useCartStore((state) => state.addItem);
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(
    product.variants && product.variants.length > 0 ? product.variants[0].id : null
  );
  const [isAdding, setIsAdding] = useState(false);
  const [justAdded, setJustAdded] = useState(false);

  const selectedVariant = product.variants?.find(v => v.id === selectedVariantId);
  const currentPrice = selectedVariant?.price || product.price;
  const currentStock = selectedVariant ? selectedVariant.stock : product.stock;
  const outOfStock = currentStock <= 0;

  function handleAddToCart() {
    if (outOfStock || isAdding) return;

    setIsAdding(true);
    addItem(
      {
        productId: product.id,
        name: product.name,
        price: currentPrice,
        imageUrl: product.imageUrl,
        category: product.category,
        variantId: selectedVariant?.id,
        variantName: selectedVariant?.name,
      },
      1
    );

    setTimeout(() => {
      setIsAdding(false);
      setJustAdded(true);
    }, 400);

    setTimeout(() => setJustAdded(false), 2200);
  }

  function handleBuyNow() {
    if (outOfStock) return;
    addItem(
      {
        productId: product.id,
        name: product.name,
        price: currentPrice,
        imageUrl: product.imageUrl,
        category: product.category,
        variantId: selectedVariant?.id,
        variantName: selectedVariant?.name,
      },
      1
    );
    router.push("/checkout");
  }

  return (
    <div className="flex flex-col gap-10">
      {/* Variant Selection */}
      {product.variants && product.variants.length > 0 && (
        <div className="grid gap-4">
          <label className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-400">
            Choose Specification
          </label>
          <div className="flex flex-wrap gap-2">
            {product.variants.map((variant) => (
              <button
                key={variant.id}
                type="button"
                onClick={() => setSelectedVariantId(variant.id)}
                className={cn(
                  "rounded-2xl border-2 px-6 py-3 text-xs font-black uppercase tracking-widest transition-all duration-300",
                  selectedVariantId === variant.id
                    ? "border-neutral-950 bg-neutral-950 text-white shadow-xl shadow-neutral-950/20"
                    : "border-neutral-100 bg-neutral-50 text-neutral-500 hover:border-neutral-200 hover:bg-white"
                )}
              >
                {variant.name}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="flex flex-col gap-4">
        {/* Main Add to Cart */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          disabled={outOfStock || isAdding}
          onClick={handleAddToCart}
          className={cn(
            "group relative flex h-16 w-full items-center justify-center gap-3 overflow-hidden rounded-full text-xs font-black uppercase tracking-[0.2em] transition-all duration-500",
            outOfStock
              ? "bg-neutral-100 text-neutral-400 cursor-not-allowed"
              : "bg-neutral-950 text-white shadow-2xl shadow-neutral-950/20 hover:shadow-neutral-950/40"
          )}
        >
          {/* Liquid background effect on hover */}
          <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent transition-transform duration-1000 group-hover:translate-x-full" />
          
          {isAdding ? (
            <Loader2 className="size-5 animate-spin" />
          ) : justAdded ? (
            <>
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="grid size-6 place-items-center rounded-full bg-[#2f9e74] text-white"
              >
                <Check className="size-4" />
              </motion.div>
              <span>Bagged</span>
            </>
          ) : (
            <>
              <ShoppingBag className="size-5" />
              <span>{outOfStock ? "Out of Stock" : "Secure Item"}</span>
            </>
          )}
        </motion.button>

        {/* Secondary Actions */}
        <div className="flex items-center gap-4">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            disabled={outOfStock}
            onClick={handleBuyNow}
            className="flex h-16 flex-1 items-center justify-center gap-3 rounded-full border-2 border-neutral-100 bg-white text-xs font-black uppercase tracking-[0.2em] text-neutral-950 transition-all hover:border-neutral-950"
          >
            <Zap className="size-5 text-[#2f9e74]" />
            Direct Checkout
          </motion.button>

          <div className="shrink-0">
            <FavoriteButton 
              product={product} 
              className="h-16 w-16 rounded-full border-2 border-neutral-100 bg-white transition-all hover:border-[#d65f5f] hover:text-[#d65f5f]" 
              iconClassName="size-6"
              withBackground={false}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
