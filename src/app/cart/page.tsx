import type { Metadata } from "next";
import { CartDisplay } from "@/components/cart/cart-display";
import { RecommendedProducts } from "@/components/product/recommended-products";

export const metadata: Metadata = {
  title: "Shopping Cart",
  description: "Review your shopping cart items before checkout.",
};

export default function CartPage() {
  return (
    <main className="bg-[#fafaf8] px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8">
          <h1 className="text-4xl font-semibold tracking-normal text-neutral-950">
            Shopping Cart
          </h1>
          <p className="mt-3 text-base leading-6 text-neutral-600">
            Review your items and proceed to checkout when ready.
          </p>
        </div>

        <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
          <CartDisplay />
        </div>

        {/* Recommended Products Section */}
        <div className="mt-12">
          <RecommendedProducts />
        </div>
      </div>
    </main>
  );
}
