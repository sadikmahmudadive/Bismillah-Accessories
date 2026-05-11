"use client";

import {
  motion,
  useScroll,
  useTransform,
  LazyMotion,
  domMax
} from "framer-motion";
import {
  ArrowRight,
  CreditCard,
  HardDrive,
  Headphones,
  PackageCheck,
  Shield,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Truck,
  Watch,
  Zap,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";

import { ProductCard } from "@/components/product/product-card";
import { ButtonLink } from "@/components/ui/button";
import { ProductCardSkeleton } from "@/components/ui/loader";
import { OfferBanners } from "@/components/home/offer-banners";
import type { Product } from "@/types/domain";

const benefits = [
  { icon: Truck, label: "Fast delivery", sub: "Dhaka & nationwide" },
  { icon: CreditCard, label: "COD & bKash", sub: "Flexible payments" },
  { icon: ShieldCheck, label: "Quality checked", sub: "Every item verified" },
  { icon: PackageCheck, label: "Easy returns", sub: "7-day policy" },
];

const categories = [
  { name: "Phone Cases", icon: Smartphone, href: "/products?category=Phone+Case", img: "https://images.unsplash.com/photo-1592890288564-76628a30a657?q=80&w=1000&auto=format&fit=crop" },
  { name: "Charging", icon: Zap, href: "/products?category=Charging", img: "https://images.unsplash.com/photo-1615526675159-e248c3021d3f?q=80&w=1000&auto=format&fit=crop" },
  { name: "Audio", icon: Headphones, href: "/products?category=Audio", img: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=1000&auto=format&fit=crop" },
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
    <main className="relative isolate overflow-hidden bg-white text-neutral-950">
      {/* ─── Hero Banners ────────────────────────────────────────── */}
      <div className="w-full">
        <OfferBanners />
      </div>

      {/* ─── The Philosophy (Storytelling Section 1) ────────────────── */}
      <section className="relative px-6 py-20 sm:px-12 lg:px-24 lg:py-40 overflow-hidden">
        <div className="mx-auto w-full max-w-7xl">
          <div className="grid gap-12 xl:grid-cols-2 xl:items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            >
              <p className="text-sm font-black uppercase tracking-[0.3em] text-[#2f9e74]">
                Our Philosophy
              </p>
              <h2 className="mt-6 break-words text-4xl font-[900] leading-[1] tracking-tighter sm:text-6xl md:text-7xl xl:text-8xl 2xl:text-9xl">
                Accessories <br className="hidden sm:block" /> 
                <span className="text-neutral-200">Reimagined.</span>
              </h2>
              <p className="mt-8 max-w-xl text-base font-medium leading-relaxed text-neutral-500 sm:text-lg lg:text-2xl lg:leading-[1.4]">
                We believe tech should be as beautiful as it is functional. Our curated collection brings world-class protection and charging to your fingertips.
              </p>
              <div className="mt-12">
                <ButtonLink href="/products" showArrow className="h-16 px-10 text-lg">
                  Explore the collection
                </ButtonLink>
              </div>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
              className="relative aspect-square w-full max-w-md mx-auto xl:max-w-none overflow-hidden rounded-[2.5rem] sm:rounded-[3rem] bg-neutral-100 shadow-2xl shadow-neutral-950/10 will-change-transform"
            >
              <Image 
                src="https://images.unsplash.com/photo-1616348436168-de43ad0db179?q=80&w=1000&auto=format&fit=crop" 
                alt="Premium tech" 
                fill
                priority
                className="h-full w-full object-cover transition-transform duration-[10s] hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
            </motion.div>
          </div>
        </div>
      </section>

      {/* ─── Innovation Grid (Storytelling Section 2) ────────────────── */}
      <section className="relative flex min-h-screen flex-col justify-center bg-neutral-950 py-24 text-white sm:py-32 lg:py-48 w-full overflow-hidden">
        {/* Subtle background texture or glow */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(47,158,116,0.08),transparent_70%)]" />
        
        <div className="relative mx-auto w-full px-6 sm:px-12 lg:px-24">
          <div className="flex flex-col items-center text-center">
            <motion.p 
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              className="text-xs font-black uppercase tracking-[0.4em] text-[#2f9e74]"
            >
              Excellence in every detail
            </motion.p>
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              className="mt-6 text-4xl font-[900] leading-[1] tracking-tighter sm:text-6xl lg:text-8xl"
            >
              Engineered for Performance.
            </motion.h2>
          </div>

          <div className="mt-24 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {benefits.map((item, i) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="group relative overflow-hidden rounded-[2.5rem] bg-white/5 p-10 backdrop-blur-sm transition-colors hover:bg-white/10"
              >
                <div className="grid size-14 place-items-center rounded-2xl bg-[#2f9e74] text-white shadow-[0_0_20px_rgba(47,158,116,0.4)]">
                  <item.icon className="size-6" />
                </div>
                <h3 className="mt-8 text-2xl font-bold">{item.label}</h3>
                <p className="mt-4 text-neutral-400 font-medium leading-relaxed">{item.sub}</p>
                <div className="mt-8 h-1 w-0 bg-[#2f9e74] transition-all duration-500 group-hover:w-full" />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Shop by Category ─────────────────────────────────────────── */}
      <section className="px-6 py-24 sm:px-12 lg:px-24 lg:py-48">
        <div className="mx-auto w-full">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center sm:text-left"
          >
            <p className="text-sm font-black uppercase tracking-[0.4em] text-[#2f9e74]">
              Collections
            </p>
            <h2 className="mt-6 text-4xl font-[900] tracking-tighter sm:text-6xl lg:text-7xl">
              Curated Selection.
            </h2>
          </motion.div>

          <div className="mt-20 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map((cat, i) => (
              <motion.div
                key={cat.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.6 }}
                className="group relative h-[450px] overflow-hidden rounded-[3rem]"
              >
                <Link href={cat.href} className="block h-full w-full">
                  <div className="absolute inset-0 transition-transform duration-1000 group-hover:scale-110 will-change-transform">
                     <Image 
                        src={cat.img} 
                        alt={cat.name} 
                        fill
                        className="h-full w-full object-cover grayscale-[0.5] transition-all duration-700 group-hover:grayscale-0" 
                     />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  <div className="absolute bottom-6 left-6 right-6 text-white sm:bottom-10 sm:left-10">
                    <cat.icon className="size-8 mb-4 opacity-80 sm:size-10 sm:mb-6" strokeWidth={1} />
                    <h3 className="text-3xl font-black tracking-tight sm:text-4xl">{cat.name}</h3>
                    <div className="mt-6 flex items-center gap-3 text-xs font-black uppercase tracking-widest opacity-0 transition-all duration-500 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0">
                      Explore Series <ArrowRight className="size-4" />
                    </div>
                  </div>
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
        className="px-6 py-24 sm:px-12 lg:px-24 bg-neutral-50 border-t border-neutral-100 lg:py-48"
      >
        <motion.div
          className="mx-auto w-full"
          style={{ opacity: productsOpacity, y: productsY }}
        >
          <div className="flex flex-col justify-between gap-8 sm:flex-row sm:items-end">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.4em] text-[#2f9e74]">
                The Shop
              </p>
              <h2 className="mt-6 text-3xl font-[900] tracking-tighter sm:text-5xl lg:text-6xl">
                New Arrivals.
              </h2>
            </div>
            <ButtonLink href="/products" variant="secondary" showArrow className="h-14">
              View all products
            </ButtonLink>
          </div>

          <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
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
              <div className="col-span-full rounded-[3rem] border-2 border-dashed border-neutral-200 bg-white py-24 text-center">
                <p className="text-lg font-bold text-neutral-400">
                  {productsError
                    ? "Connectivity issue. Please refresh."
                    : "Fresh arrivals are on the way."}
                </p>
              </div>
            )}
          </div>
        </motion.div>
      </section>

      {/* ─── CTA Banner ───────────────────────────────────────────────── */}
      <section className="relative flex min-h-[80svh] flex-col justify-center overflow-hidden bg-neutral-950 px-8 py-24 text-center w-full sm:min-h-screen">
        {/* Background glow */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -left-32 -top-32 size-[800px] rounded-full bg-[#2f9e74]/10 blur-[160px]" />
          <div className="absolute -bottom-32 -right-32 size-[800px] rounded-full bg-[#2f9e74]/10 blur-[160px]" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative mx-auto max-w-7xl"
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-6 py-2 text-xs font-black uppercase tracking-widest text-white/60 backdrop-blur-md">
            <Sparkles className="size-3.5 text-[#2f9e74]" />
            Limited offer
          </div>
          <h2 className="mt-8 text-3xl font-[900] leading-[1.1] tracking-tighter text-white sm:text-5xl lg:text-7xl xl:text-8xl">
            Complimentary Delivery <br className="hidden sm:block" />
            on Orders Above ৳999
          </h2>
          <p className="mx-auto mt-10 max-w-2xl text-lg font-medium text-white/50 lg:text-2xl lg:leading-relaxed">
            Elevate your experience with free nationwide shipping on all curated premium selections.
          </p>
          <div className="mt-16 flex flex-col items-center gap-6 sm:flex-row sm:justify-center">
            <Link
              href="/products"
              className="group/btn relative inline-flex h-16 items-center gap-4 overflow-hidden rounded-full bg-[#2f9e74] px-12 text-sm font-black uppercase tracking-widest text-white shadow-2xl shadow-[#2f9e74]/40 transition-all hover:scale-105 active:scale-95"
            >
              <span className="relative">Shop now</span>
              <ArrowRight className="relative size-4" />
            </Link>
            <Link
              href="/auth"
              className="inline-flex h-16 items-center gap-3 rounded-full border border-white/10 bg-white/5 px-12 text-sm font-black uppercase tracking-widest text-white backdrop-blur-md transition hover:bg-white/10"
            >
              Join the Circle
            </Link>
          </div>
        </motion.div>
      </section>
    </main>
  );
}
