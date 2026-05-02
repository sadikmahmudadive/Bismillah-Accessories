import type { Metadata } from "next";

import { ProductBrowser } from "@/components/product/product-browser";
import { ProductEmptyState } from "@/components/product/product-empty-state";
import { getActiveProducts } from "@/lib/products";
import type { Product } from "@/types/domain";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Products",
  description: "Browse accessories from Bismillah Accessories.",
};

export default async function ProductsPage() {
  let products: Product[] = [];
  let errorMessage: string | null = null;

  try {
    products = await getActiveProducts();
  } catch (error) {
    errorMessage =
      error instanceof Error
        ? error.message
        : "Could not load products from Firestore.";
  }

  return (
    <main className="bg-[#fafaf8] px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#d65f5f]">
              Product Catalog
            </p>
            <h1 className="mt-3 text-4xl font-semibold tracking-normal text-neutral-950">
              Browse accessories
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-neutral-600">
              Search, filter, and open product details from the Firestore
              catalog. Admins can publish products from the dashboard.
            </p>
          </div>
        </div>

        {errorMessage ? (
          <ProductEmptyState message={errorMessage} />
        ) : products.length > 0 ? (
          <ProductBrowser products={products} />
        ) : (
          <ProductEmptyState />
        )}
      </div>
    </main>
  );
}
