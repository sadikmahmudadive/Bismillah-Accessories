import { motion } from "framer-motion";

interface ProductFiltersProps {
  categories: string[];
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  sortBy: string;
  onSortChange: (sortBy: string) => void;
  searchTerm: string;
  onSearchChange: (search: string) => void;
}

const sortOptions = [
  { value: "name", label: "Name (A-Z)" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
  { value: "newest", label: "Newest First" },
];

export function ProductFilters({
  categories,
  selectedCategory,
  onCategoryChange,
  sortBy,
  onSortChange,
  searchTerm,
  onSearchChange,
}: ProductFiltersProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      {/* Search */}
      <div>
        <label className="block text-sm font-semibold text-neutral-700 mb-2">
          Search Products
        </label>
        <input
          type="text"
          placeholder="Search by name, description..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full rounded-2xl border border-neutral-200 bg-[#fafaf8] px-4 py-3 text-sm font-medium text-neutral-950 outline-none transition focus:border-neutral-950 placeholder:text-neutral-400"
        />
      </div>

      {/* Category Filter */}
      <div>
        <label className="block text-sm font-semibold text-neutral-700 mb-3">
          Category
        </label>
        <div className="space-y-2">
          {["all", ...categories].map((category) => (
            <motion.label
              key={category}
              whileHover={{ x: 4 }}
              className="flex items-center cursor-pointer"
            >
              <input
                type="radio"
                name="category"
                value={category}
                checked={selectedCategory === category}
                onChange={(e) => onCategoryChange(e.target.value)}
                className="size-4 text-[#2f9e74] focus:ring-[#2f9e74]/50"
              />
              <span className="ml-3 text-sm text-neutral-700 capitalize">
                {category === "all" ? "All Products" : category}
              </span>
            </motion.label>
          ))}
        </div>
      </div>

      {/* Sort Options */}
      <div>
        <label className="block text-sm font-semibold text-neutral-700 mb-2">
          Sort By
        </label>
        <select
          value={sortBy}
          onChange={(e) => onSortChange(e.target.value)}
          className="w-full rounded-2xl border border-neutral-200 bg-[#fafaf8] px-4 py-3 text-sm font-medium text-neutral-950 outline-none transition focus:border-neutral-950"
        >
          {sortOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
    </motion.div>
  );
}
