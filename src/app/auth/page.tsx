import type { Metadata } from "next";
import { ShieldCheck, Sparkles, Truck, Zap } from "lucide-react";

import { AuthForm } from "@/components/auth/auth-form";

export const metadata: Metadata = {
  title: "Account",
  description: "Sign in or create an account for Bismillah Accessories.",
};

const features = [
  {
    icon: ShieldCheck,
    title: "Secure authentication",
    desc: "Powered by Firebase — your data is safe",
  },
  {
    icon: Truck,
    title: "Track your orders",
    desc: "Real-time order status after checkout",
  },
  {
    icon: Zap,
    title: "Faster checkout",
    desc: "Saved address for one-tap ordering",
  },
  {
    icon: Sparkles,
    title: "Admin access",
    desc: "Role-based dashboard for store owners",
  },
];

export default function AuthPage() {
  return (
    <main className="min-h-[calc(100svh-4rem)] bg-[#fafaf8] px-4 py-14 sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[1fr_1fr] lg:items-start">
        {/* Left — brand panel */}
        <section className="relative overflow-hidden rounded-[2rem] bg-neutral-950 p-8 text-white shadow-2xl lg:sticky lg:top-24">
          {/* Glows */}
          <div className="pointer-events-none absolute -left-16 -top-16 size-64 rounded-full bg-[#2f9e74]/20 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-16 -right-8 size-48 rounded-full bg-[#b8860b]/15 blur-3xl" />

          <div className="relative">
            {/* Logo mark */}
            <div className="grid size-12 place-items-center rounded-full bg-white/10 text-sm font-black text-white backdrop-blur">
              BA
            </div>

            <h1 className="mt-6 text-4xl font-bold leading-tight tracking-tight">
              Your Bismillah <br />
              <span className="text-[#2f9e74]">Accessories</span> account
            </h1>
            <p className="mt-4 text-sm leading-7 text-white/65">
              Sign in to manage your orders, track deliveries, and access the
              admin dashboard if you&apos;re a store owner.
            </p>

            <div className="mt-8 grid gap-4">
              {features.map((f) => (
                <div key={f.title} className="flex items-start gap-4">
                  <div className="grid size-9 shrink-0 place-items-center rounded-full bg-white/10">
                    <f.icon className="size-4 text-[#2f9e74]" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">
                      {f.title}
                    </p>
                    <p className="text-xs text-white/55">{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Testimonial */}
            <div className="mt-10 rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="text-sm italic text-white/70">
                &ldquo;Great accessories at unbeatable prices. Delivery was
                fast and COD made it super easy!&rdquo;
              </p>
              <div className="mt-3 flex items-center gap-2">
                <div className="grid size-7 place-items-center rounded-full bg-[#2f9e74] text-[11px] font-bold text-white">
                  R
                </div>
                <div>
                  <p className="text-xs font-semibold text-white">Rahim K.</p>
                  <p className="text-[11px] text-white/40">Verified customer</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Right — auth form */}
        <AuthForm />
      </div>
    </main>
  );
}
