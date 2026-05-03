"use client";

import { Heart } from "lucide-react";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

import { useFavoritesStore } from "@/lib/store/favorites";
import type { Product } from "@/types/domain";
import { cn } from "@/lib/utils";

type FavoriteButtonProps = {
  product: Product;
  className?: string;
  iconClassName?: string;
  withBackground?: boolean;
};

export function FavoriteButton({ 
  product, 
  className, 
  iconClassName,
  withBackground = true 
}: FavoriteButtonProps) {
  // Prevent hydration mismatch by checking if mounted
  const [isMounted, setIsMounted] = useState(false);
  const { hasItem, addItem, removeItem } = useFavoritesStore();
  
  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return (
      <div 
        className={cn(
          withBackground && "grid place-items-center rounded-full bg-white/80 p-2 shadow-sm backdrop-blur",
          className
        )}
      >
        <Heart className={cn("size-5 text-neutral-300", iconClassName)} />
      </div>
    );
  }

  const isFavorite = hasItem(product.id);

  const toggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent navigating if inside a Link
    e.stopPropagation();
    if (isFavorite) {
      removeItem(product.id);
    } else {
      addItem(product);
    }
  };

  return (
    <motion.button
      whileTap={{ scale: 0.85 }}
      onClick={toggleFavorite}
      className={cn(
        withBackground && "grid place-items-center rounded-full bg-white/80 p-2 shadow-sm backdrop-blur transition hover:bg-white",
        className
      )}
      aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
    >
      <Heart 
        className={cn(
          "size-5 transition-colors", 
          isFavorite ? "fill-[#d65f5f] text-[#d65f5f]" : "text-neutral-400 hover:text-[#d65f5f]",
          iconClassName
        )} 
      />
    </motion.button>
  );
}
