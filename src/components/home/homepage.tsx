"use client";

import {
  motion,
  useMotionValue,
  useScroll,
  useSpring,
  useTransform,
} from "framer-motion";
import {
  ArrowRight,
  Award,
  CreditCard,
  HardDrive,
  Headphones,
  PackageCheck,
  Shield,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Star,
  Truck,
  Watch,
  Zap,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";

import { ProductCard } from "@/components/product/product-card";
import { ButtonLink } from "@/components/ui/button";
import { ProductCardSkeleton } from "@/components/ui/loader";
import { OfferBanners } from "@/components/home/offer-banners";
import { AnimatedHeroTitle } from "@/components/home/animated-hero-title";
import type { Product } from "@/types/domain";

const benefits = [
  { icon: Truck, label: "Fast delivery", sub: "Dhaka & nationwide" },
  { icon: CreditCard, label: "COD & bKash", sub: "Flexible payments" },
  { icon: ShieldCheck, label: "Quality checked", sub: "Every item verified" },
  { icon: PackageCheck, label: "Easy returns", sub: "7-day policy" },
];

const stats = [
  { value: "500+", label: "Products" },
  { value: "10k+", label: "Happy customers" },
  { value: "4.9★", label: "Average rating" },
  { value: "48h", label: "Avg delivery" },
];

const categories = [
  { name: "Phone Cases", icon: Smartphone, href: "/products?category=Phone+Case" },
  { name: "Charging", icon: Zap, href: "/products?category=Charging" },
  { name: "Protection", icon: Shield, href: "/products?category=Protection" },
  { name: "Audio", icon: Headphones, href: "/products?category=Audio" },
  { name: "Smart Watch", icon: Watch, href: "/products?category=Watch" },
  { name: "Storage", icon: HardDrive, href: "/products?category=Storage" },
];

export function Homepage() {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);
  const [productsError, setProductsError] = useState<string | null>(null);

  const productsRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: productsRef,
    offset: ["start end", "end start"],
  });
  const productsOpacity = useTransform(scrollYProgress, [0, 0.2], [0, 1]);
  const productsY = useTransform(scrollYProgress, [0, 0.2], [40, 0]);

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        setIsLoadingProducts(true);
        setProductsError(null);
        const res = await fetch("/api/products?limit=4&sortBy=newest");
        if (!res.ok) throw new Error(`${res.status}`);
        const data = await res.json();
        if (data.success) {
          const active = (data.data as Product[]).filter(
            (p) => p.status === "active"
          );
          setFeaturedProducts(active.slice(0, 4));
        } else {
          throw new Error(data.error || "Failed");
        }
      } catch (err) {
        setProductsError(
          err instanceof Error ? err.message : "Failed to load products"
        );
      } finally {
        setIsLoadingProducts(false);
      }
    };
    void fetchFeatured();
  }, []);

  return (
    <main className="relative isolate overflow-hidden bg-transparent text-neutral-950">
      {/* ─── Dynamic Banners ────────────────────────────────────────── */}
      <div className="mx-auto max-w-7xl px-4 pt-10 sm:px-6 lg:px-8">
        <OfferBanners />
      </div>

      {/* ─── Hero ─────────────────────────────────────────────────────── */}
      <section className="relative min-h-[50svh] px-4 pb-16 pt-14 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-[1.1fr_0.9fr]">
          <motion.div
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.15, duration: 0.5 }}
              className="inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-white/80 px-4 py-1.5 text-sm font-semibold text-neutral-700 shadow-sm backdrop-blur"
            >
              <Sparkles className="size-3.5 text-[#b8860b]" />
              Bangladesh&apos;s premium accessory store
            </motion.div>

            <AnimatedHeroTitle />

            <p className="mt-6 max-w-xl text-lg leading-8 text-neutral-600">
              Elevate your everyday tech with curated premium accessories.
              Fast, reliable delivery across Bangladesh.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <ButtonLink href="/products" showArrow>
                Browse products
              </ButtonLink>
              <ButtonLink href="/auth" variant="secondary">
                Create account
              </ButtonLink>
            </div>

            {/* Benefit chips */}
            <div className="mt-10 grid max-w-xl grid-cols-2 gap-3 sm:grid-cols-4">
              {benefits.map((item, i) => (
                <motion.div
                  key={item.label}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + i * 0.07 }}
                  whileHover={{ y: -4, scale: 1.03 }}
                  className="rounded-2xl border border-neutral-200 bg-white/80 p-3.5 shadow-sm backdrop-blur"
                >
                  <item.icon className="size-5 text-[#2f9e74]" />
                  <p className="mt-2.5 text-sm font-semibold leading-5 text-neutral-800">
                    {item.label}
                  </p>
                  <p className="text-xs text-neutral-500">{item.sub}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Hero card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 28 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.15, ease: "easeOut" }}
            className="relative hidden lg:block"
          >
            <div className="rounded-[2rem] border border-white/80 bg-white/85 p-4 shadow-[0_32px_96px_rgba(0,0,0,0.14)] backdrop-blur-2xl">
              <div className="rounded-[1.6rem] border border-neutral-100 bg-[#f6f4ee] p-5">
                {/* Card header */}
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-widest text-neutral-400">
                      Store status
                    </p>
                    <p className="mt-1 text-2xl font-bold text-neutral-950">
                      Live & ready
                    </p>
                  </div>
                  <span className="flex items-center gap-1.5 rounded-full bg-[#2f9e74]/15 px-3 py-1.5 text-xs font-bold text-[#257a5a]">
                    <span className="size-2 rounded-full bg-[#2f9e74] animate-pulse" />
                    Online
                  </span>
                </div>

                {/* Stats */}
                <div className="mt-5 grid grid-cols-2 gap-3">
                  {stats.map((s) => (
                    <div
                      key={s.label}
                      className="rounded-2xl bg-white px-4 py-3 shadow-sm"
                    >
                      <p className="text-xl font-bold text-neutral-950">
                        {s.value}
                      </p>
                      <p className="text-xs text-neutral-500">{s.label}</p>
                    </div>
                  ))}
                </div>

                {/* Recent activity */}
                <div className="mt-4 space-y-2">
                  {[
                    { text: "New order placed — Phone Case", time: "2m ago" },
                    { text: "Charging Cable sold out", time: "14m ago" },
                    { text: "bKash payment confirmed", time: "31m ago" },
                  ].map((item) => (
                    <div
                      key={item.text}
                      className="flex items-center justify-between rounded-xl bg-white px-3 py-2.5 shadow-sm"
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="size-2 rounded-full bg-[#2f9e74]" />
                        <span className="text-xs font-medium text-neutral-700">
                          {item.text}
                        </span>
                      </div>
                      <span className="text-[11px] text-neutral-400">
                        {item.time}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Floating review badge */}
            <motion.div
              animate={{ y: [0, -6, 0] }}
              transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
              className="absolute -bottom-4 -left-6 flex items-center gap-2.5 rounded-2xl bg-white px-4 py-3 shadow-xl"
            >
              <div className="flex -space-x-1.5">
                {["#2f9e74", "#b8860b", "#d65f5f"].map((c) => (
                  <span
                    key={c}
                    className="grid size-7 place-items-center rounded-full border-2 border-white text-[10px] font-bold text-white"
                    style={{ background: c }}
                  >
                    ★
                  </span>
                ))}
              </div>
              <div>
                <p className="text-xs font-bold text-neutral-950">4.9 / 5.0</p>
                <p className="text-[11px] text-neutral-500">from 2.4k reviews</p>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ─── Stats bar ────────────────────────────────────────────────── */}
      <section className="border-y border-neutral-200 bg-white/60 backdrop-blur-xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {[
              { icon: Award, label: "Premium Quality", value: "100%" },
              { icon: Truck, label: "Delivery Coverage", value: "Nationwide" },
              { icon: Star, label: "Customer Rating", value: "4.9 / 5" },
              { icon: Zap, label: "Order Processing", value: "Same day" },
            ].map((item, i) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="flex items-center gap-3"
              >
                <div className="grid size-10 shrink-0 place-items-center rounded-full bg-[#f6f4ee]">
                  <item.icon className="size-4 text-[#2f9e74]" />
                </div>
                <div>
                  <p className="text-sm font-bold text-neutral-950">
                    {item.value}
                  </p>
                  <p className="text-xs text-neutral-500">{item.label}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Shop by Category ─────────────────────────────────────────── */}
      <section className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.55 }}
          >
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#2f9e74]">
              Categories
            </p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
              Shop by type
            </h2>
          </motion.div>

          <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            {categories.map((cat, i) => (
              <motion.div
                key={cat.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06, duration: 0.4 }}
                whileHover={{ y: -6, scale: 1.04 }}
              >
                <Link
                  href={cat.href}
                  className="group flex flex-col items-center gap-3 rounded-[1.75rem] border border-neutral-200 bg-white p-5 shadow-sm transition hover:border-[#2f9e74]/40 hover:shadow-lg"
                >
                  <div className="grid size-12 place-items-center rounded-2xl bg-[#f6f4ee] transition group-hover:bg-[#2f9e74]/10 group-hover:text-[#2f9e74]">
                    <cat.icon className="size-6 text-neutral-600 transition group-hover:text-[#2f9e74]" strokeWidth={1.5} />
                  </div>
                  <span className="text-center text-sm font-semibold text-neutral-800 transition group-hover:text-neutral-950">
                    {cat.name}
                  </span>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Featured Products ────────────────────────────────────────── */}
      <section
        ref={productsRef}
        id="products"
        className="bg-white/40 backdrop-blur-lg border-y border-neutral-200/60 px-4 py-16 sm:px-6 lg:px-8"
      >
        <motion.div
          className="mx-auto max-w-7xl"
          style={{ opacity: productsOpacity, y: productsY }}
        >
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#2f9e74]">
                Featured
              </p>
              <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
                Bestsellers
              </h2>
            </div>
            <ButtonLink href="/products" variant="secondary" showArrow>
              View all products
            </ButtonLink>
          </div>

          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {isLoadingProducts ? (
              Array.from({ length: 4 }).map((_, i) => (
                <ProductCardSkeleton key={i} />
              ))
            ) : featuredProducts.length > 0 ? (
              featuredProducts.map((product, i) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08, duration: 0.45 }}
                >
                  <ProductCard product={product} />
                </motion.div>
              ))
            ) : (
              <div className="col-span-full rounded-[2rem] border border-dashed border-neutral-300 bg-white py-16 text-center">
                <p className="text-neutral-500">
                  {productsError
                    ? "Failed to load products"
                    : "No products yet — add some in the admin panel."}
                </p>
                <div className="mt-6 flex justify-center gap-3">
                  <ButtonLink href="/admin" variant="secondary">
                    Open admin
                  </ButtonLink>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </section>

      {/* ─── CTA Banner ───────────────────────────────────────────────── */}
      <section className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative overflow-hidden rounded-[2.5rem] bg-neutral-950 px-8 py-14 text-center sm:px-16"
          >
            {/* Background glow */}
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
              <div className="absolute -left-32 -top-32 size-96 rounded-full bg-[#2f9e74]/20 blur-3xl" />
              <div className="absolute -bottom-32 -right-32 size-96 rounded-full bg-[#b8860b]/15 blur-3xl" />
            </div>

            <div className="relative">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-1.5 text-sm font-semibold text-white/80">
                <Sparkles className="size-3.5 text-[#b8860b]" />
                Limited time offer
              </div>
              <h2 className="mt-6 text-3xl font-bold text-white sm:text-4xl lg:text-5xl">
                Free delivery on orders <br className="hidden sm:block" />
                over ৳999
              </h2>
              <p className="mx-auto mt-4 max-w-lg text-base text-white/70">
                Shop now and enjoy free home delivery on any order above ৳999.
                Valid for Cash on Delivery and bKash payments.
              </p>
              <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
                <Link
                  href="/products"
                  className="inline-flex h-12 items-center gap-2 rounded-full bg-white px-6 text-sm font-semibold text-neutral-950 shadow-lg transition hover:-translate-y-0.5 hover:shadow-xl"
                >
                  Shop now <ArrowRight className="size-4" />
                </Link>
                <Link
                  href="/auth"
                  className="inline-flex h-12 items-center gap-2 rounded-full border border-white/25 px-6 text-sm font-semibold text-white transition hover:bg-white/10"
                >
                  Create account
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </main>
  );
}
