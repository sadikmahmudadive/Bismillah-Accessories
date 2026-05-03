"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useMemo, useState, useEffect, Suspense } from "react";

import { ProductCard } from "@/components/product/product-card";
import { ProductCardSkeleton } from "@/components/ui/loader";
import { productCategories } from "@/lib/products";
import { cn } from "@/lib/utils";
import type { Product } from "@/types/domain";

function ProductBrowserInner({ products }: { products: Product[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Initialise from URL params so category chips & navbar search work
  const [query, setQuery] = useState(searchParams.get("q") ?? "");
  const [category, setCategory] = useState(
    searchParams.get("category") ?? "All"
  );

  // Sync URL → state when params change externally (e.g. back/forward)
  useEffect(() => {
    setQuery(searchParams.get("q") ?? "");
    setCategory(searchParams.get("category") ?? "All");
  }, [searchParams]);

  const pushParams = useCallback(
    (newQ: string, newCat: string) => {
      const params = new URLSearchParams();
      if (newQ) params.set("q", newQ);
      if (newCat !== "All") params.set("category", newCat);
      const qs = params.toString();
      router.replace(`/products${qs ? `?${qs}` : ""}`, { scroll: false });
    },
    [router]
  );

  const handleQuery = (value: string) => {
    setQuery(value);
    pushParams(value, category);
  };

  const handleCategory = (value: string) => {
    setCategory(value);
    pushParams(query, value);
  };

  const clearQuery = () => handleQuery("");

  const categories = useMemo(() => {
    const usedCategories = Array.from(
      new Set(products.map((p) => p.category).filter(Boolean))
    );
    return ["All", ...new Set([...productCategories, ...usedCategories])];
  }, [products]);

  const filteredProducts = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return products.filter((product) => {
      const matchesCategory =
        category === "All" || product.category === category;
      const matchesQuery =
        !normalizedQuery ||
        [product.name, product.description, product.category, ...product.tags]
          .join(" ")
          .toLowerCase()
          .includes(normalizedQuery);
      return matchesCategory && matchesQuery;
    });
  }, [category, products, query]);

  return (
    <div className="mt-8">
      {/* Search + filter bar */}
      <div className="rounded-[2rem] border border-neutral-200 bg-white p-3 shadow-sm">
        {/* Search input */}
        <label className="flex min-h-12 items-center gap-3 rounded-[1.35rem] bg-[#f6f4ee] px-4 text-neutral-500">
          <Search className="size-4 shrink-0" />
          <span className="sr-only">Search products</span>
          <input
            value={query}
            onChange={(e) => handleQuery(e.target.value)}
            placeholder="Search cases, cables, protection..."
            className="min-w-0 flex-1 bg-transparent text-sm font-semibold text-neutral-950 outline-none placeholder:text-neutral-400"
          />
          <AnimatePresence>
            {query && (
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                type="button"
                onClick={clearQuery}
                className="grid size-6 shrink-0 place-items-center rounded-full bg-neutral-200 text-neutral-600 hover:bg-neutral-300"
                aria-label="Clear search"
              >
                <X className="size-3.5" />
              </motion.button>
            )}
          </AnimatePresence>
        </label>

        {/* Category chips */}
        <div className="mt-3 flex items-center gap-2 overflow-x-auto pb-1">
          <div className="grid size-9 shrink-0 place-items-center rounded-full bg-neutral-950 text-white">
            <SlidersHorizontal className="size-3.5" />
          </div>
          {categories.map((item) => (
            <motion.button
              key={item}
              type="button"
              whileTap={{ scale: 0.95 }}
              onClick={() => handleCategory(item)}
              className={cn(
                "h-9 shrink-0 rounded-full px-4 text-sm font-semibold transition-all",
                category === item
                  ? "bg-[#2f9e74] text-white shadow-sm"
                  : "bg-[#f6f4ee] text-neutral-600 hover:bg-neutral-200 hover:text-neutral-950"
              )}
            >
              {item}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Result count */}
      <p className="mt-4 text-sm font-medium text-neutral-500">
        {filteredProducts.length === products.length
          ? `${products.length} product${products.length !== 1 ? "s" : ""}`
          : `${filteredProducts.length} of ${products.length} products`}
        {query && (
          <span className="ml-1 text-neutral-400">
            for &ldquo;{query}&rdquo;
          </span>
        )}
      </p>

      {/* Grid */}
      <AnimatePresence mode="popLayout">
        {filteredProducts.length > 0 ? (
          <motion.div
            layout
            className="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-4"
          >
            {filteredProducts.map((product, i) => (
              <motion.div
                key={product.id}
                layout
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3, delay: i * 0.03 }}
              >
                <ProductCard product={product} />
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <motion.div
            key="empty"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mt-6 rounded-[2rem] border border-dashed border-neutral-300 bg-white p-16 text-center"
          >
            <div className="mx-auto mb-4 grid size-14 place-items-center rounded-full bg-neutral-100">
              <Search className="size-6 text-neutral-400" />
            </div>
            <h2 className="text-xl font-semibold text-neutral-950">
              No products found
            </h2>
            <p className="mt-2 text-sm text-neutral-500">
              Try a different search term or select a different category.
            </p>
            {(query || category !== "All") && (
              <button
                type="button"
                onClick={() => {
                  handleQuery("");
                  handleCategory("All");
                }}
                className="mt-5 rounded-full border border-neutral-200 px-5 py-2 text-sm font-semibold text-neutral-700 hover:bg-neutral-100"
              >
                Clear filters
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Suspense wrapper needed because useSearchParams() requires it in Next.js App Router
export function ProductBrowser({ products }: { products: Product[] }) {
  return (
    <Suspense
      fallback={
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <ProductCardSkeleton key={i} />
          ))}
        </div>
      }
    >
      <ProductBrowserInner products={products} />
    </Suspense>
  );
}
