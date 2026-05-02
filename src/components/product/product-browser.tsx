"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Search, SlidersHorizontal } from "lucide-react";
import { useMemo, useState } from "react";

import { ProductCard } from "@/components/product/product-card";
import { productCategories } from "@/lib/products";
import { cn } from "@/lib/utils";
import type { Product } from "@/types/domain";

export function ProductBrowser({ products }: { products: Product[] }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");

  const categories = useMemo(() => {
    const usedCategories = Array.from(
      new Set(products.map((product) => product.category).filter(Boolean)),
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
      <div className="grid gap-3 rounded-[2rem] border border-neutral-200 bg-white p-3 shadow-sm lg:grid-cols-[1fr_auto]">
        <label className="flex min-h-12 items-center gap-3 rounded-[1.35rem] bg-[#f6f4ee] px-4 text-neutral-500">
          <Search className="size-4" />
          <span className="sr-only">Search products</span>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search cases, cables, protection..."
            className="min-w-0 flex-1 bg-transparent text-sm font-semibold text-neutral-950 outline-none placeholder:text-neutral-400"
          />
        </label>

        <div className="flex items-center gap-2 overflow-x-auto">
          <div className="grid size-10 shrink-0 place-items-center rounded-full bg-neutral-950 text-white">
            <SlidersHorizontal className="size-4" />
          </div>
          {categories.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setCategory(item)}
              className={cn(
                "h-10 shrink-0 rounded-full px-4 text-sm font-semibold transition",
                category === item
                  ? "bg-[#2f9e74] text-white"
                  : "bg-[#f6f4ee] text-neutral-600 hover:text-neutral-950",
              )}
            >
              {item}
            </button>
          ))}
        </div>
      </div>

      <AnimatePresence mode="popLayout">
        {filteredProducts.length > 0 ? (
          <motion.div
            layout
            className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4"
          >
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                name={product.name}
                category={product.category}
                price={product.price}
                imageUrl={product.imageUrl}
                href={`/products/${product.slug}`}
              />
            ))}
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mt-6 rounded-[2rem] border border-dashed border-neutral-300 bg-white p-8 text-center"
          >
            <h2 className="text-xl font-semibold text-neutral-950">
              No products found
            </h2>
            <p className="mt-2 text-sm text-neutral-600">
              Try a different search term or category filter.
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
