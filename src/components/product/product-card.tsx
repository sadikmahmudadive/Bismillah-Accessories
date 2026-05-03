"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowUpRight, ShoppingBag, Star } from "lucide-react";
import { useState } from "react";

import { useCartStore } from "@/lib/store/cart";
import { FavoriteButton } from "@/components/product/favorite-button";
import type { Product } from "@/types/domain";

export type ProductCardProps = {
  product?: Product;
  // Legacy props for backward compatibility
  name?: string;
  category?: string;
  price?: number;
  imageUrl?: string;
  accent?: string;
  href?: string;
};

export function ProductCard({
  product,
  name,
  category,
  price,
  imageUrl,
  accent = "#2f9e74",
  href,
}: ProductCardProps) {
  const [isAdding, setIsAdding] = useState(false);
  const addItem = useCartStore((state) => state.addItem);

  // Use product data if provided, otherwise fall back to legacy props
  const displayName = product?.name || name || "Product";
  const displayCategory = product?.category || category || "Accessory";
  const displayPrice = product?.price || price || 0;
  const displayImage = product?.imageUrl || imageUrl;
  const productLink = product ? `/products/${product.slug}` : href;

  const handleAddToCart = async () => {
    if (!product) return;

    setIsAdding(true);
    try {
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
      // Show success feedback
      setTimeout(() => setIsAdding(false), 500);
    } catch (error) {
      console.error("Error adding to cart:", error);
      setIsAdding(false);
    }
  };

  return (
    <motion.article
      whileHover={{ y: -6 }}
      transition={{ type: "spring", stiffness: 260, damping: 22 }}
      className="group rounded-[1.75rem] border border-neutral-200 bg-white p-3 shadow-sm transition hover:shadow-2xl hover:shadow-neutral-950/10"
    >
      <Link href={productLink || "#"} className="block">
        <div className="relative aspect-[4/3] overflow-hidden rounded-[1.35rem] bg-neutral-100">
          {displayImage ? (
            <Image
              src={displayImage}
              alt={displayName}
              fill
              sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
              className="object-cover transition duration-500 group-hover:scale-105"
            />
          ) : (
            <div
              className="absolute inset-0"
              style={{
                background: `radial-gradient(circle at 30% 20%, ${accent}55, transparent 34%), linear-gradient(135deg, #f8faf8, #ece8de 48%, #f7f7f3)`,
              }}
            />
          )}
          <div className="absolute bottom-3 left-3 rounded-full bg-white/80 px-3 py-1 text-xs font-semibold text-neutral-700 backdrop-blur">
            {displayCategory}
          </div>
          {product && (
            <FavoriteButton 
              product={product} 
              className="absolute right-3 top-3" 
            />
          )}
        </div>
      </Link>

      <div className="p-3">
        <div className="flex items-start justify-between gap-3">
          <Link href={productLink || "#"} className="flex-1 min-w-0">
            <h3 className="text-base font-semibold text-neutral-950 line-clamp-2 hover:text-neutral-700 transition">
              {displayName}
            </h3>
            {product?.averageRating ? (
              <div className="mt-1 flex items-center gap-1 text-xs font-semibold text-neutral-500">
                <Star className="size-3 fill-[#b8860b] text-[#b8860b]" />
                <span>{product.averageRating.toFixed(1)}</span>
                <span className="text-neutral-400">({product.reviewCount})</span>
              </div>
            ) : null}
          </Link>
          {productLink ? (
            <Link
              href={productLink}
              aria-label={`View ${displayName}`}
              title={`View ${displayName}`}
              className="grid size-8 shrink-0 place-items-center rounded-full bg-neutral-100 text-neutral-700 transition hover:bg-neutral-950 hover:text-white"
            >
              <ArrowUpRight className="size-4" />
            </Link>
          ) : null}
        </div>
        <div className="mt-3 flex items-center justify-between gap-3">
          <span className="text-sm font-semibold text-neutral-700">
            ৳{displayPrice.toLocaleString("en-BD")}
          </span>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleAddToCart}
            disabled={isAdding || !product || product.stock === 0}
            aria-label={`Add ${displayName} to cart`}
            className="size-10 px-0 rounded-full bg-neutral-950 text-white hover:bg-neutral-800 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center justify-center"
          >
            <ShoppingBag className={`size-4 ${isAdding ? "animate-pulse" : ""}`} />
          </motion.button>
        </div>
      </div>
    </motion.article>
  );
}
