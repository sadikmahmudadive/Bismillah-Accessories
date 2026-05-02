"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

import { ProductCard } from "@/components/product/product-card";
import { ProductCardSkeleton } from "@/components/ui/loader";
import type { Product } from "@/types/domain";

export function RecommendedProducts() {
  const [recommendedProducts, setRecommendedProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRecommendedProducts = async () => {
      try {
        setIsLoading(true);
        setError(null);

        console.log("🛒 Fetching recommended products for cart page");
        const response = await fetch('/api/products?limit=4&sortBy=newest');

        if (!response.ok) {
          throw new Error(`Failed to fetch products: ${response.status}`);
        }

        const data = await response.json();

        if (data.success) {
          const activeProducts = data.data.filter((product: Product) => product.status === 'active');
          setRecommendedProducts(activeProducts.slice(0, 4));
          console.log(`✅ Loaded ${activeProducts.length} recommended products`);
        } else {
          throw new Error(data.error || 'Failed to load products');
        }
      } catch (error) {
        console.error('❌ Error fetching recommended products:', error);
        setError(error instanceof Error ? error.message : 'Failed to load products');
      } finally {
        setIsLoading(false);
      }
    };

    fetchRecommendedProducts();
  }, []);

  if (isLoading) {
    return (
      <section className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
        <div className="mb-6">
          <h2 className="text-2xl font-semibold text-neutral-950">
            You might also like
          </h2>
          <p className="mt-2 text-sm text-neutral-600">
            Discover more products while you review your cart.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <ProductCardSkeleton key={i} />
          ))}
        </div>
      </section>
    );
  }

  if (error || recommendedProducts.length === 0) {
    return null; // Don't show section if there's an error or no products
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  return (
    <motion.section
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm"
    >
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-neutral-950">
          You might also like
        </h2>
        <p className="mt-2 text-sm text-neutral-600">
          Discover more products while you review your cart.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {recommendedProducts.map((product) => (
          <motion.div key={product.id} variants={itemVariants}>
            <ProductCard product={product} />
          </motion.div>
        ))}
      </div>
    </motion.section>
  );
}