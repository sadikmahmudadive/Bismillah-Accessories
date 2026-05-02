"use client";

import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { Check, CreditCard, PackageCheck, ShieldCheck, Sparkles, Truck } from "lucide-react";
import { useEffect } from "react";

import { HeroScene } from "@/components/home/hero-scene";
import { ProductCard } from "@/components/product/product-card";
import { ButtonLink } from "@/components/ui/button";
import { ProductCardSkeleton } from "@/components/ui/loader";

const previewProducts = [
  {
    name: "MagSafe Clear Case",
    category: "Phone Case",
    price: 1250,
    accent: "#2f9e74",
  },
  {
    name: "Braided USB-C Cable",
    category: "Charging",
    price: 850,
    accent: "#d65f5f",
  },
  {
    name: "Matte Camera Lens Guard",
    category: "Protection",
    price: 690,
    accent: "#b8860b",
  },
];

const benefits = [
  { icon: Truck, label: "Fast local delivery" },
  { icon: CreditCard, label: "COD and bKash ready" },
  { icon: ShieldCheck, label: "Admin-controlled catalog" },
  { icon: PackageCheck, label: "Order tracking foundation" },
];

export function Homepage() {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const smoothX = useSpring(mouseX, { stiffness: 80, damping: 18 });
  const smoothY = useSpring(mouseY, { stiffness: 80, damping: 18 });
  const glowX = useTransform(smoothX, (value) => `${value}px`);
  const glowY = useTransform(smoothY, (value) => `${value}px`);

  useEffect(() => {
    const handlePointer = (event: PointerEvent) => {
      mouseX.set(event.clientX);
      mouseY.set(event.clientY);
    };

    window.addEventListener("pointermove", handlePointer);
    return () => window.removeEventListener("pointermove", handlePointer);
  }, [mouseX, mouseY]);

  return (
    <main className="relative isolate overflow-hidden bg-[#fafaf8] text-neutral-950">
      <motion.div
        aria-hidden="true"
        className="pointer-events-none fixed left-0 top-0 z-50 hidden size-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#2f9e74]/10 blur-3xl lg:block"
        style={{ x: glowX, y: glowY }}
      />

      <section className="relative min-h-[calc(100svh-4rem)] px-4 pb-16 pt-14 sm:px-6 lg:px-8">
        <HeroScene />
        <div className="mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-[1.05fr_0.95fr]">
          <motion.div
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, ease: "easeOut" }}
            className="max-w-3xl"
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-white/70 px-3 py-1 text-sm font-semibold text-neutral-700 shadow-sm backdrop-blur">
              <Sparkles className="size-4 text-[#b8860b]" />
              Premium accessories commerce starter
            </div>
            <h1 className="mt-6 max-w-4xl text-5xl font-semibold leading-[1.03] tracking-normal text-neutral-950 sm:text-6xl lg:text-7xl">
              Bismillah Accessories
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-neutral-650">
              A polished e-commerce foundation for mobile accessories, with a
              fast storefront, cart-ready interaction model, and admin workflows
              planned around Firebase, Cloudinary, COD, and bKash.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <ButtonLink href="/products" showArrow>
                Browse products
              </ButtonLink>
              <ButtonLink href="/admin" variant="secondary">
                Open admin
              </ButtonLink>
            </div>
            <div className="mt-10 grid max-w-xl grid-cols-2 gap-3 sm:grid-cols-4">
              {benefits.map((item) => (
                <motion.div
                  key={item.label}
                  whileHover={{ y: -4 }}
                  className="rounded-3xl border border-neutral-200 bg-white/75 p-4 shadow-sm backdrop-blur"
                >
                  <item.icon className="size-5 text-[#2f9e74]" />
                  <p className="mt-3 text-sm font-semibold leading-5 text-neutral-700">
                    {item.label}
                  </p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          <motion.div
            id="operations"
            initial={{ opacity: 0, scale: 0.96, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.75, delay: 0.12, ease: "easeOut" }}
            className="relative"
          >
            <div className="rounded-[2rem] border border-white/70 bg-white/78 p-3 shadow-[0_30px_90px_rgba(31,31,31,0.16)] backdrop-blur-2xl">
              <div className="rounded-[1.55rem] border border-neutral-200 bg-[#f6f4ee] p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-neutral-500">
                      Today&apos;s storefront
                    </p>
                    <h2 className="mt-1 text-2xl font-semibold text-neutral-950">
                      Live preview
                    </h2>
                  </div>
                  <div className="rounded-full bg-neutral-950 px-3 py-1 text-xs font-semibold text-white">
                    Phase 1
                  </div>
                </div>
                <div className="mt-5 grid gap-3">
                  {previewProducts.map((product) => (
                    <div
                      key={product.name}
                      className="flex items-center justify-between rounded-2xl bg-white p-3 shadow-sm"
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className="size-12 rounded-2xl"
                          style={{
                            background: `radial-gradient(circle at 35% 25%, ${product.accent}66, transparent 36%), #f7f7f2`,
                          }}
                        />
                        <div>
                          <p className="text-sm font-semibold text-neutral-950">
                            {product.name}
                          </p>
                          <p className="text-xs font-medium text-neutral-500">
                            {product.category}
                          </p>
                        </div>
                      </div>
                      <Check className="size-5 text-[#2f9e74]" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <section id="products" className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#d65f5f]">
                Storefront System
              </p>
              <h2 className="mt-3 text-3xl font-semibold tracking-normal sm:text-4xl">
                Reusable product cards and loading states
              </h2>
            </div>
            <p className="max-w-xl text-sm leading-6 text-neutral-600">
              These components are ready to connect to Firestore in the product
              module. For now, they define the UI contract, animation behavior,
              and responsive grid.
            </p>
          </div>

          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {previewProducts.map((product) => (
              <ProductCard key={product.name} {...product} />
            ))}
            <ProductCardSkeleton />
          </div>
        </div>
      </section>
    </main>
  );
}
