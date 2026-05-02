"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

import { ProductCard } from "@/components/product/product-card";
import { ProductCardSkeleton } from "@/components/ui/loader";
import type { Product } from "@/types/domain";

export function OrderProducts() {
  const [orderProducts, setOrderProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrderProducts = async () => {
      try {
        setIsLoading(true);
        setError(null);

        console.log("📦 Fetching products for order confirmation page");
        const response = await fetch('/api/products?limit=4&sortBy=newest');

        if (!response.ok) {
          throw new Error(`Failed to fetch products: ${response.status}`);
        }

        const data = await response.json();

        if (data.success) {
          const activeProducts = data.data.filter((product: Product) => product.status === 'active');
          setOrderProducts(activeProducts.slice(0, 4));
          console.log(`✅ Loaded ${activeProducts.length} products for order page`);
        } else {
          throw new Error(data.error || 'Failed to load products');
        }
      } catch (error) {
        console.error('❌ Error fetching order products:', error);
        setError(error instanceof Error ? error.message : 'Failed to load products');
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrderProducts();
  }, []);

  if (isLoading) {
    return (
      <section className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
        <div className="mb-6">
          <h2 className="text-2xl font-semibold text-neutral-950">
            Shop more accessories
          </h2>
          <p className="mt-2 text-sm text-neutral-600">
            Explore our full collection of premium mobile accessories.
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

  if (error || orderProducts.length === 0) {
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
          Shop more accessories
        </h2>
        <p className="mt-2 text-sm text-neutral-600">
          Explore our full collection of premium mobile accessories.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {orderProducts.map((product) => (
          <motion.div key={product.id} variants={itemVariants}>
            <ProductCard product={product} />
          </motion.div>
        ))}
      </div>

      <div className="mt-8 text-center">
        <a
          href="/products"
          className="inline-flex items-center gap-2 text-sm font-semibold text-[#2f9e74] hover:text-[#257a5a] transition-colors"
        >
          View all products
          <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </a>
      </div>
    </motion.section>
  );
}