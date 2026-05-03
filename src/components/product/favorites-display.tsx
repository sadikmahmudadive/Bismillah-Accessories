"use client";

import { useEffect, useState } from "react";
import { HeartCrack } from "lucide-react";
import { motion } from "framer-motion";

import { useFavoritesStore } from "@/lib/store/favorites";
import { ProductCard } from "@/components/product/product-card";
import { ButtonLink } from "@/components/ui/button";
import { ProductCardSkeleton } from "@/components/ui/loader";

export function FavoritesDisplay() {
  const [isMounted, setIsMounted] = useState(false);
  const { items } = useFavoritesStore();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return (
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <ProductCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-[2rem] border border-neutral-200/60 bg-white/60 p-12 text-center backdrop-blur-xl">
        <div className="grid size-16 place-items-center rounded-full bg-neutral-100 text-neutral-400">
          <HeartCrack className="size-8" />
        </div>
        <h2 className="mt-4 text-xl font-semibold text-neutral-950">
          No favorites yet
        </h2>
        <p className="mt-2 text-sm text-neutral-600 max-w-md">
          You haven't added any items to your favorites. Browse our collection and click the heart icon to save items for later!
        </p>
        <div className="mt-8">
          <ButtonLink href="/products">Browse products</ButtonLink>
        </div>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4"
    >
      {items.map((product, idx) => (
        <motion.div
          key={product.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: idx * 0.05 }}
        >
          <ProductCard product={product} />
        </motion.div>
      ))}
    </motion.div>
  );
}
