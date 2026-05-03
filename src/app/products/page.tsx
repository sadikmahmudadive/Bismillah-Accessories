import { getActiveProducts } from "@/lib/products";
import { ProductBrowser } from "@/components/product/product-browser";

export const metadata = {
  title: "Products | Bismillah Accessories",
  description: "Browse our premium mobile accessories and tech essentials.",
};

export default async function ProductsPage() {
  const products = await getActiveProducts();

  return (
    <main className="bg-transparent px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col gap-4">
          <h1 className="text-4xl font-bold tracking-tight text-neutral-950 sm:text-5xl">
            Our Collection
          </h1>
          <p className="max-w-2xl text-lg text-neutral-600">
            Discover premium mobile accessories, everyday tech essentials, and
            gift-ready add-ons designed for quality and style.
          </p>
        </div>

        <ProductBrowser products={products} />
      </div>
    </main>
  );
}