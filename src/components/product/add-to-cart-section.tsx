"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Check, Loader2, ShoppingBag, Zap } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { useCartStore } from "@/lib/store/cart";
import { FavoriteButton } from "@/components/product/favorite-button";
import type { Product } from "@/types/domain";

export function AddToCartSection({ product }: { product: Product }) {
  const router = useRouter();
  const addItem = useCartStore((state) => state.addItem);
  const [isAdding, setIsAdding] = useState(false);
  const [justAdded, setJustAdded] = useState(false);

  const outOfStock = product.stock <= 0;

  function handleAddToCart() {
    if (outOfStock || isAdding) return;

    setIsAdding(true);
    addItem(
      {
        productId: product.id,
        name: product.name,
        price: product.price,
        imageUrl: product.imageUrl,
        category: product.category,
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
        price: product.price,
        imageUrl: product.imageUrl,
        category: product.category,
      },
      1
    );
    router.push("/checkout");
  }

  return (
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
  );
}
