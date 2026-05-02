import type { Metadata } from "next";
import { ShieldCheck, ShoppingBag } from "lucide-react";

import { AuthForm } from "@/components/auth/auth-form";

export const metadata: Metadata = {
  title: "Account",
  description: "Sign in or create an account for Bismillah Accessories.",
};

export default function AuthPage() {
  return (
    <main className="bg-[#fafaf8] px-4 py-14 sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
        <section className="rounded-[2rem] border border-neutral-200 bg-white p-6 shadow-sm">
          <div className="grid size-12 place-items-center rounded-full bg-neutral-950 text-white">
            <ShoppingBag className="size-5" />
          </div>
          <h1 className="mt-6 text-4xl font-semibold tracking-normal text-neutral-950">
            Account access for checkout and admin workflows
          </h1>
          <p className="mt-4 text-sm leading-6 text-neutral-600">
            Firebase Authentication powers customer sign-in. New customers get a
            Firestore profile in the users collection, with role-based admin
            access ready for the dashboard.
          </p>

          <div className="mt-6 grid gap-3">
            {[
              "Email and password authentication",
              "Firestore users collection",
              "Admin role gate for operations",
            ].map((item) => (
              <div
                key={item}
                className="flex items-center gap-3 rounded-2xl bg-[#f6f4ee] px-4 py-3 text-sm font-semibold text-neutral-700"
              >
                <ShieldCheck className="size-4 text-[#2f9e74]" />
                {item}
              </div>
            ))}
          </div>
        </section>

        <AuthForm />
      </div>
    </main>
  );
}
