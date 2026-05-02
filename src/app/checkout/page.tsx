import type { Metadata } from "next";

import { AuthGate } from "@/components/auth/auth-gate";
import { CheckoutForm } from "@/components/checkout/checkout-form";
import { PopularProducts } from "@/components/product/popular-products";

export const metadata: Metadata = {
  title: "Checkout",
  description: "Complete your order — delivery details, COD, or bKash payment.",
};

export default function CheckoutPage() {
  return (
    <AuthGate>
      <main className="bg-[#fafaf8] px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="mb-8">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#d65f5f]">
              Checkout
            </p>
            <h1 className="mt-3 text-4xl font-semibold tracking-normal text-neutral-950">
              Delivery & payment
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-neutral-600">
              Enter your delivery address and choose a payment method. Orders are
              saved to Firestore and confirmed instantly.
            </p>
          </div>

          <CheckoutForm />

          {/* Popular Products Section */}
          <div className="mt-16">
            <PopularProducts />
          </div>
        </div>
      </main>
    </AuthGate>
  );
}
