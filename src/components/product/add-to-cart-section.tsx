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
    <div className="flex flex-col gap-6">
      <p className="text-3xl font-semibold text-neutral-900">
        ৳{currentPrice.toLocaleString("en-BD")}
      </p>

      {/* Variant Selection */}
      {product.variants && product.variants.length > 0 && (
        <div className="grid gap-3">
          <label className="text-xs font-bold uppercase tracking-wider text-neutral-400">
            Select Option
          </label>
          <div className="flex flex-wrap gap-2">
            {product.variants.map((variant) => (
              <button
                key={variant.id}
                type="button"
                onClick={() => setSelectedVariantId(variant.id)}
                className={cn(
                  "rounded-xl border px-4 py-2 text-sm font-semibold transition-all",
                  selectedVariantId === variant.id
                    ? "border-neutral-950 bg-neutral-950 text-white shadow-md"
                    : "border-neutral-200 bg-white text-neutral-600 hover:border-neutral-300 hover:bg-neutral-50"
                )}
              >
                {variant.name}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="flex flex-col gap-3 sm:flex-row">
        <Button
          type="button"
          disabled={outOfStock || isAdding}
          onClick={handleAddToCart}
          className="flex-1"
        >
          {isAdding ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              Adding…
            </>
          ) : justAdded ? (
            <>
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              >
                <Check className="size-4" />
              </motion.span>
              Added to cart
            </>
          ) : (
            <>
              <ShoppingBag className="size-4" />
              {outOfStock ? "Out of stock" : "Add to cart"}
            </>
          )}
        </Button>

        <div className="flex flex-1 gap-3">
          <Button
            type="button"
            variant="secondary"
            disabled={outOfStock}
            onClick={handleBuyNow}
            className="flex-1"
          >
            <Zap className="size-4" />
            Buy now
          </Button>
          <FavoriteButton 
            product={product} 
            className="h-12 w-12 shrink-0 rounded-[1.25rem]" 
            iconClassName="size-5"
            withBackground={true}
          />
        </div>
      </div>
    </div>
  );
}
