import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import type { Product } from "@/types/domain";
import { ProductCard } from "./product-card";
import { ProductFilters } from "./product-filters";
import { Skeleton } from "@/components/ui/loader";

interface ProductsGridProps {
  initialProducts?: Product[];
  initialCategories?: string[];
}

export function ProductsGrid({
  initialProducts = [],
  initialCategories = [],
}: ProductsGridProps) {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>(
    initialProducts
  );
  const [categories, setCategories] = useState<string[]>(initialCategories);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState("name");
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Fetch products when filters change
  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);
      try {
        const params = new URLSearchParams();

        if (selectedCategory !== "all") {
          params.append("category", selectedCategory);
        }

        if (searchTerm) {
          params.append("search", searchTerm);
        }

        params.append("sortBy", sortBy);

        const response = await fetch(`/api/products?${params.toString()}`);
        const result = await response.json();

        if (result.success) {
          setProducts(result.data);
          setFilteredProducts(result.data);

          // Update categories from first batch if empty
          if (categories.length === 0) {
            const uniqueCategories = Array.from(
              new Set(result.data.map((p: Product) => p.category))
            ) as string[];
            setCategories(uniqueCategories);
          }
        }
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setIsLoading(false);
      }
    };

    const debounceTimer = setTimeout(fetchProducts, 300);
    return () => clearTimeout(debounceTimer);
  }, [selectedCategory, sortBy, searchTerm, categories.length]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
      {/* Filters Sidebar */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
        className="lg:col-span-1"
      >
        <ProductFilters
          categories={categories}
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
          sortBy={sortBy}
          onSortChange={setSortBy}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
        />
      </motion.div>

      {/* Products Grid */}
      <motion.div
        className="lg:col-span-3"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <motion.div key={i} variants={itemVariants}>
                <Skeleton className="w-full h-80 rounded-lg" />
              </motion.div>
            ))}
          </div>
        ) : filteredProducts.length > 0 ? (
          <motion.div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map((product) => (
              <motion.div key={product.id} variants={itemVariants}>
                <ProductCard product={product} />
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <motion.div
            variants={itemVariants}
            className="col-span-full text-center py-12"
          >
            <p className="text-gray-500 dark:text-gray-400">
              No products found. Try adjusting your filters.
            </p>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
