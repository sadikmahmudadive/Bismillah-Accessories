"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowUpRight, ShoppingBag, Star, Sparkles } from "lucide-react";
import { useState } from "react";

import { cn } from "@/lib/utils";

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
  const productLink = product ? `/products/${product.slug || product.id}` : href;

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
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      whileHover={{ y: -8 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="group relative flex flex-col overflow-hidden rounded-[2.5rem] bg-white transition-all duration-500 hover:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.15)]"
    >
      <div className="relative aspect-[1/1.1] overflow-hidden rounded-[2.2rem] bg-[#fdfdfd] m-2 transition-all duration-700 group-hover:shadow-[inset_0_0_40px_rgba(0,0,0,0.02)]">
        <Link href={productLink || "#"} className="block h-full w-full p-6">
          <div className="relative h-full w-full">
            {displayImage ? (
              <Image
                src={displayImage}
                alt={displayName}
                fill
                sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
                className="object-contain transition-all duration-1000 ease-[0.16,1,0.3,1] group-hover:scale-110 group-hover:rotate-2"
              />
            ) : (
              <div
                className="absolute inset-0 rounded-2xl"
                style={{
                  background: `radial-gradient(circle at 30% 20%, ${accent}55, transparent 34%), linear-gradient(135deg, #f8faf8, #ece8de 48%, #f7f7f3)`,
                }}
              />
            )}
          </div>
        </Link>
        
        {/* Specular Highlight Glow on Hover */}
        <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-700 group-hover:opacity-100 bg-[radial-gradient(circle_at_var(--mouse-x,50%)_var(--mouse-y,50%),rgba(255,255,255,0.6),transparent_60%)]" />

        {/* Floating Category Badge */}
        <div className="absolute left-5 top-5 overflow-hidden rounded-full border border-neutral-200/50 bg-white/60 px-3 py-1 text-[9px] font-[900] uppercase tracking-[0.2em] text-neutral-500 backdrop-blur-xl">
          {displayCategory}
        </div>

        {product && (
          <FavoriteButton 
            product={product} 
            className="absolute right-5 top-5 scale-90 opacity-0 transition-all duration-500 group-hover:opacity-100 group-hover:scale-100" 
          />
        )}

        {/* Quick Add Overlay - Liquid Motion */}
        <div className="absolute inset-x-0 bottom-0 flex translate-y-full items-center justify-center p-5 transition-all duration-700 ease-[0.16,1,0.3,1] group-hover:translate-y-0">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleAddToCart}
            disabled={isAdding || !product || product.stock === 0}
            className="flex w-full items-center justify-center gap-3 rounded-2xl bg-neutral-950 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-white shadow-2xl transition-all duration-500 hover:bg-[#2f9e74] hover:shadow-[#2f9e74]/40"
          >
            <ShoppingBag className={`size-4 ${isAdding ? "animate-pulse" : ""}`} />
            {isAdding ? "Processing..." : "Add to Cart"}
          </motion.button>
        </div>
      </div>

      <div className="flex flex-col px-8 pb-8 pt-4">
        <Link href={productLink || "#"} className="group/title">
          <div className="flex items-start justify-between gap-4">
            <h3 className="text-xl font-[800] leading-tight tracking-tight text-neutral-950 transition-colors duration-300 group-hover/title:text-[#2f9e74]">
              {displayName}
            </h3>
            <span className="mt-1 text-base font-[900] tracking-tighter text-neutral-950">
              ৳{displayPrice.toLocaleString("en-BD")}
            </span>
          </div>
          
          <div className="mt-4 flex items-center justify-between">
            {product?.averageRating ? (
              <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.15em] text-neutral-400">
                <div className="flex items-center gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star 
                      key={i} 
                      className={cn(
                        "size-2.5",
                        i < Math.floor(product.averageRating ?? 0) 
                          ? "fill-[#b8860b] text-[#b8860b]" 
                          : "fill-neutral-200 text-neutral-200"
                      )} 
                    />
                  ))}
                </div>
                <span>{product.averageRating.toFixed(1)}</span>
                <span className="text-neutral-200">|</span>
                <span>{product.reviewCount} Reviews</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.15em] text-neutral-400">
                <Sparkles className="size-3 text-[#2f9e74]" />
                <span>Certified Authentic</span>
              </div>
            )}
            
            <div className="translate-x-4 opacity-0 transition-all duration-500 group-hover:translate-x-0 group-hover:opacity-100">
               <div className="grid size-8 place-items-center rounded-full bg-[#f6f4ee] text-[#2f9e74]">
                  <ArrowUpRight className="size-4" />
               </div>
            </div>
          </div>
        </Link>
      </div>
    </motion.article>
  );
}
