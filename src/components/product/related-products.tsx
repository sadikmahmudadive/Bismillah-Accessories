"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

import { ProductCard } from "@/components/product/product-card";
import { ProductCardSkeleton } from "@/components/ui/loader";
import type { Product } from "@/types/domain";

export function RelatedProducts({ 
  currentProductId, 
  category 
}: { 
  currentProductId: string;
  category: string;
}) {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchRelated() {
      try {
        setIsLoading(true);
        const res = await fetch(`/api/products?category=${encodeURIComponent(category)}&limit=5`);
        const payload = await res.json();
        
        if (payload.success) {
          // Filter out current product and take first 4
          const filtered = payload.data
            .filter((p: Product) => p.id !== currentProductId && p.status === "active")
            .slice(0, 4);
          setProducts(filtered);
        }
      } catch (err) {
        console.error("Failed to fetch related products:", err);
      } finally {
        setIsLoading(false);
      }
    }

    void fetchRelated();
  }, [category, currentProductId]);

  if (isLoading) {
    return (
      <div className="mt-20">
        <h2 className="text-2xl font-semibold text-neutral-950">You might also like</h2>
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <ProductCardSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  if (products.length === 0) return null;

  return (
    <div className="mt-20">
      <h2 className="text-2xl font-semibold text-neutral-950">You might also like</h2>
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4"
      >
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </motion.div>
    </div>
  );
}
