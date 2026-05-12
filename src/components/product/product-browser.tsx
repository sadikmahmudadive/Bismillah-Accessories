"use client";

import { AnimatePresence, motion } from "framer-motion";
import { 
  Search, 
  SlidersHorizontal, 
  X, 
  ChevronDown, 
  Star, 
  ArrowUpDown, 
  FilterX,
  LayoutGrid
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useMemo, useState, useEffect, Suspense } from "react";

import { ProductCard } from "@/components/product/product-card";
import { ProductCardSkeleton } from "@/components/ui/loader";
import { productCategories } from "@/lib/products";
import { cn } from "@/lib/utils";
import type { Product } from "@/types/domain";

type SortOption = "newest" | "price-asc" | "price-desc" | "top-rated";

function ProductBrowserInner({ products }: { products: Product[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // State
  const [query, setQuery] = useState(searchParams.get("q") ?? "");
  const [category, setCategory] = useState(searchParams.get("category") ?? "All");
  const [sortBy, setSortBy] = useState<SortOption>((searchParams.get("sort") as SortOption) ?? "newest");
  const [priceRange, setPriceRange] = useState<[number, number]>([
    Number(searchParams.get("minPrice")) || 0,
    Number(searchParams.get("maxPrice")) || 10000,
  ]);
  const [minRating, setMinRating] = useState(Number(searchParams.get("minRating")) || 0);
  const [showFilters, setShowFilters] = useState(false);

  // Sync state with URL
  useEffect(() => {
    setQuery(searchParams.get("q") ?? "");
    setCategory(searchParams.get("category") ?? "All");
    setSortBy((searchParams.get("sort") as SortOption) ?? "newest");
    setPriceRange([
      Number(searchParams.get("minPrice")) || 0,
      Number(searchParams.get("maxPrice")) || 10000,
    ]);
    setMinRating(Number(searchParams.get("minRating")) || 0);
  }, [searchParams]);

  const pushParams = useCallback(
    (updates: Record<string, string | number | undefined>) => {
      const params = new URLSearchParams(searchParams.toString());
      Object.entries(updates).forEach(([key, value]) => {
        if (value === undefined || value === "All" || value === "" || (key === "minRating" && value === 0)) {
          params.delete(key);
        } else {
          params.set(key, String(value));
        }
      });
      const qs = params.toString();
      router.replace(`/products${qs ? `?${qs}` : ""}`, { scroll: false });
    },
    [router, searchParams]
  );

  const categories = useMemo(() => {
    const usedCategories = Array.from(new Set(products.map((p) => p.category).filter(Boolean)));
    return ["All", ...new Set([...productCategories, ...usedCategories])];
  }, [products]);

  const filteredAndSortedProducts = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    
    let result = products.filter((product) => {
      const matchesCategory = category === "All" || product.category === category;
      const matchesQuery =
        !normalizedQuery ||
        [product.name, product.description, product.category, ...product.tags]
          .join(" ")
          .toLowerCase()
          .includes(normalizedQuery);
      const matchesPrice = product.price >= priceRange[0] && product.price <= priceRange[1];
      const matchesRating = (product.averageRating || 0) >= minRating;
      
      return matchesCategory && matchesQuery && matchesPrice && matchesRating;
    });

    // Sorting
    return result.sort((a, b) => {
      switch (sortBy) {
        case "price-asc": return a.price - b.price;
        case "price-desc": return b.price - a.price;
        case "top-rated": return (b.averageRating || 0) - (a.averageRating || 0);
        case "newest":
        default:
          return (b as any).createdAt?.seconds - (a as any).createdAt?.seconds;
      }
    });
  }, [category, products, query, priceRange, minRating, sortBy]);

  const resetFilters = () => {
    setQuery("");
    setCategory("All");
    setSortBy("newest");
    setPriceRange([0, 10000]);
    setMinRating(0);
    router.replace("/products", { scroll: false });
  };

  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="mt-8">
      {/* Top Controls */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="relative flex-1">
          <Search className="absolute left-6 top-1/2 size-5 -translate-y-1/2 text-neutral-400" />
          <input
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              pushParams({ q: e.target.value });
            }}
            placeholder="Search precision collection..."
            className="h-14 w-full rounded-2xl border border-neutral-100 bg-neutral-50 pl-14 pr-12 text-base font-bold text-neutral-950 outline-none transition focus:border-[#2f9e74] focus:bg-white focus:shadow-2xl focus:shadow-[#2f9e74]/5 lg:h-16 lg:pl-16 lg:text-lg"
          />
          {query && (
            <button 
              onClick={() => { setQuery(""); pushParams({ q: "" }); }}
              className="absolute right-6 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-950"
            >
              <X className="size-5" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={cn(
              "flex h-14 items-center gap-3 rounded-2xl border px-6 text-[10px] font-black uppercase tracking-widest transition-all lg:h-16 lg:px-8 lg:text-xs",
              showFilters || category !== "All" || minRating > 0 || priceRange[0] > 0 || priceRange[1] < 10000
                ? "border-neutral-950 bg-neutral-950 text-white shadow-xl shadow-neutral-950/20"
                : "border-neutral-100 bg-neutral-50 text-neutral-700 hover:border-neutral-200 hover:bg-white"
            )}
          >
            <SlidersHorizontal className="size-4" />
            Filters
            {(category !== "All" || minRating > 0 || priceRange[0] > 0) && (
              <span className="ml-1 size-2 rounded-full bg-[#2f9e74] shadow-[0_0_8px_#2f9e74]" />
            )}
          </button>

          <div className="relative group">
            <select
              value={sortBy}
              onChange={(e) => {
                const val = e.target.value as SortOption;
                setSortBy(val);
                pushParams({ sort: val });
              }}
              className="h-14 appearance-none rounded-2xl border border-neutral-100 bg-neutral-50 pl-6 pr-10 text-[10px] font-black uppercase tracking-widest text-neutral-700 outline-none transition hover:border-neutral-200 hover:bg-white focus:border-neutral-950 lg:h-16 lg:pl-8 lg:pr-12"
            >
              <option value="newest">Sort: Newest First</option>
              <option value="price-asc">Sort: Price ↑</option>
              <option value="price-desc">Sort: Price ↓</option>
              <option value="top-rated">Sort: Top Rated</option>
            </select>
            <ChevronDown className="absolute right-4 top-1/2 size-4 -translate-y-1/2 text-neutral-400 pointer-events-none" />
          </div>
        </div>
      </div>

      <div className="mt-8 flex flex-col gap-8 lg:flex-row lg:items-start">
        {/* Sidebar Filters */}
        <AnimatePresence>
          {(showFilters || (mounted && window.innerWidth >= 1024)) && (
            <motion.aside
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className={cn(
                "w-full shrink-0 space-y-8 lg:w-64",
                !showFilters && "hidden lg:block"
              )}
            >
              {/* Categories */}
              <div className="bg-white p-6 rounded-3xl border border-neutral-200 shadow-sm lg:bg-transparent lg:p-0 lg:border-none lg:shadow-none">
                <h3 className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-neutral-400">
                  <LayoutGrid className="size-3.5" /> Sub-categories
                </h3>
                <div className="mt-4 flex flex-wrap gap-2 lg:flex-col lg:gap-1">
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => {
                        setCategory(cat);
                        pushParams({ category: cat });
                      }}
                      className={cn(
                        "rounded-xl px-4 py-2 text-left text-sm font-bold transition-all",
                        category === cat
                          ? "bg-neutral-950 text-white shadow-lg shadow-neutral-950/15"
                          : "text-neutral-500 hover:bg-neutral-100 hover:text-neutral-950"
                      )}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Range */}
              <div className="bg-white p-6 rounded-3xl border border-neutral-200 shadow-sm lg:bg-transparent lg:p-0 lg:border-none lg:shadow-none">
                <h3 className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-neutral-400">
                  <ArrowUpDown className="size-3.5" /> Price Range
                </h3>
                <div className="mt-4 space-y-4">
                  <div className="flex items-center justify-between gap-3">
                    <input
                      type="number"
                      placeholder="Min"
                      value={priceRange[0] || ""}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        setPriceRange([val, priceRange[1]]);
                        pushParams({ minPrice: val });
                      }}
                      className="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-2 text-sm font-bold outline-none focus:border-neutral-950"
                    />
                    <span className="text-neutral-300">—</span>
                    <input
                      type="number"
                      placeholder="Max"
                      value={priceRange[1] || ""}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        setPriceRange([priceRange[0], val]);
                        pushParams({ maxPrice: val });
                      }}
                      className="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-2 text-sm font-bold outline-none focus:border-neutral-950"
                    />
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {[500, 1000, 2000, 5000].map(p => (
                      <button
                        key={p}
                        onClick={() => {
                          setPriceRange([0, p]);
                          pushParams({ minPrice: 0, maxPrice: p });
                        }}
                        className="rounded-full bg-neutral-100 px-3 py-1 text-[10px] font-bold text-neutral-600 hover:bg-neutral-200"
                      >
                        Under ৳{p}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Ratings */}
              <div className="bg-white p-6 rounded-3xl border border-neutral-200 shadow-sm lg:bg-transparent lg:p-0 lg:border-none lg:shadow-none">
                <h3 className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-neutral-400">
                  <Star className="size-3.5" /> Minimum Rating
                </h3>
                <div className="mt-4 flex flex-col gap-1">
                  {[4, 3, 2, 0].map((rating) => (
                    <button
                      key={rating}
                      onClick={() => {
                        setMinRating(rating);
                        pushParams({ minRating: rating });
                      }}
                      className={cn(
                        "flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-bold transition-all",
                        minRating === rating
                          ? "bg-neutral-950 text-white shadow-lg shadow-neutral-950/15"
                          : "text-neutral-500 hover:bg-neutral-100 hover:text-neutral-950"
                      )}
                    >
                      {rating === 0 ? "Any Rating" : (
                        <>
                          <div className="flex items-center gap-0.5">
                            {[...Array(rating)].map((_, i) => (
                              <Star key={i} className="size-3 fill-current" />
                            ))}
                          </div>
                          <span>{rating}+ Stars</span>
                        </>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Reset */}
              <button
                onClick={resetFilters}
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-neutral-100 py-3 text-xs font-bold text-neutral-600 transition-colors hover:bg-[#d65f5f]/10 hover:text-[#d65f5f]"
              >
                <FilterX className="size-3.5" />
                Reset All Filters
              </button>
            </motion.aside>
          )}
        </AnimatePresence>

        {/* Product Grid */}
        <div className="flex-1 min-w-0">
          <div className="mb-8 flex items-center justify-between">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-neutral-400">
              Discovered <span className="text-neutral-950">{filteredAndSortedProducts.length}</span> curated pieces
            </p>
          </div>

          <AnimatePresence mode="popLayout">
            {filteredAndSortedProducts.length > 0 ? (
              <motion.div
                layout
                className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
              >
                {filteredAndSortedProducts.map((product, i) => (
                  <motion.div
                    key={product.id}
                    layout
                    initial={{ opacity: 0, y: 18 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.3, delay: i * 0.02 }}
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
                className="mt-6 rounded-[2.5rem] border border-dashed border-neutral-300 bg-white p-20 text-center"
              >
                <div className="mx-auto mb-6 grid size-20 place-items-center rounded-full bg-neutral-100">
                  <Search className="size-8 text-neutral-400" />
                </div>
                <h2 className="text-2xl font-bold text-neutral-950">No products match</h2>
                <p className="mt-3 text-neutral-500 max-w-xs mx-auto">
                  We couldn&apos;t find any accessories that match your current filters. 
                  Try clearing some criteria.
                </p>
                <button
                  type="button"
                  onClick={resetFilters}
                  className="mt-8 rounded-full bg-neutral-950 px-8 py-3 text-sm font-bold text-white shadow-xl shadow-neutral-950/20 transition hover:scale-105"
                >
                  Clear all filters
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
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
