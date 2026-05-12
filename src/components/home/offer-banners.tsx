"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Sparkles, ArrowRight } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";
import type { OfferBanner } from "@/types/domain";

interface OfferBannersProps {
  initialBanners: OfferBanner[];
}

export function OfferBanners({ initialBanners }: OfferBannersProps) {
  const [banners, setBanners] = useState<OfferBanner[]>(initialBanners);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(initialBanners.length === 0);
  const [direction, setDirection] = useState(0);

  useEffect(() => {
    // Only fetch if we don't have initial banners
    if (initialBanners.length > 0) return;

    async function fetchBanners() {
      try {
        const res = await fetch("/api/banners");
        const payload = await res.json();
        if (res.ok) setBanners(payload.data || []);
      } catch (err) {
        console.error("Failed to fetch banners", err);
      } finally {
        setIsLoading(false);
      }
    }
    void fetchBanners();
  }, []);

  // Auto-slide
  useEffect(() => {
    if (banners.length <= 1) return;
    const timer = setInterval(() => {
      paginate(1);
    }, 6000);
    return () => clearInterval(timer);
  }, [banners.length, currentIndex]);

  const paginate = (newDirection: number) => {
    setDirection(newDirection);
    setCurrentIndex((prev) => (prev + newDirection + banners.length) % banners.length);
  };

  if (isLoading) {
    return <div className="h-[calc(100vh-64px)] min-h-[600px] w-full animate-pulse bg-neutral-100" />;
  }

  if (banners.length === 0) return null;

  const currentBanner = banners[currentIndex];

  const variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 1000 : -1000,
      opacity: 0,
      scale: 0.95
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
      scale: 1
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? 1000 : -1000,
      opacity: 0,
      scale: 1.05
    })
  };

  return (
    <section className="relative group overflow-hidden bg-neutral-950 shadow-2xl h-[calc(100vh-64px)] min-h-[600px] w-full">
      <AnimatePresence initial={false} custom={direction}>
        <motion.div
          key={currentIndex}
          custom={direction}
          variants={variants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{
            x: { type: "spring", stiffness: 300, damping: 30 },
            opacity: { duration: 0.4 },
            scale: { duration: 0.5 }
          }}
          className="absolute inset-0 will-change-transform"
        >
          {/* Background Image with Ken Burns Effect */}
          <div className="absolute inset-0 overflow-hidden">
            <motion.div
              key={`img-container-${currentIndex}`}
              initial={{ scale: 1.1, opacity: 0 }}
              animate={{ scale: 1, opacity: 0.55 }}
              transition={{ duration: 6, ease: "easeOut" }}
              className="relative h-full w-full"
            >
              <Image 
                src={currentBanner.imageUrl} 
                alt={currentBanner.title}
                fill
                priority={currentIndex === 0}
                sizes="100vw"
                className="h-full w-full object-cover"
                loading={currentIndex === 0 ? "eager" : "lazy"}
              />
            </motion.div>
            {/* Multi-layered Gradients for Depth */}
            <div className="absolute inset-0 bg-gradient-to-r from-neutral-950 via-neutral-950/60 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-transparent to-neutral-950/20" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_50%,rgba(47,158,116,0.1),transparent_50%)]" />
          </div>

          {/* Content */}
          <div className="relative flex h-full flex-col justify-center px-8 sm:px-20">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-white backdrop-blur-md"
            >
              <Sparkles className="size-3 text-[#2f9e74]" />
              Limited Offer
            </motion.div>
            
            <motion.h2 
              initial={{ opacity: 0, y: 30, filter: "blur(10px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              transition={{ delay: 0.4, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="mt-6 max-w-4xl text-3xl font-[900] leading-[1] tracking-tighter text-white sm:text-6xl md:text-7xl lg:text-8xl"
            >
              {currentBanner.title}
            </motion.h2>
            
            {currentBanner.subtitle && (
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.55, duration: 0.8 }}
                className="mt-6 max-w-xl text-lg font-medium text-white/60 sm:text-xl lg:text-2xl"
              >
                {currentBanner.subtitle}
              </motion.p>
            )}

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.8 }}
              className="mt-12"
            >
              <Link 
                href={currentBanner.link || "/products"}
                className="group/btn relative inline-flex items-center gap-4 overflow-hidden rounded-full bg-white px-12 py-5 text-sm font-black uppercase tracking-widest text-neutral-950 transition-all hover:scale-105 active:scale-95"
              >
                <div className="absolute inset-0 bg-[#2f9e74] translate-y-full transition-transform duration-500 group-hover/btn:translate-y-0" />
                <span className="relative transition-colors duration-500 group-hover/btn:text-white">
                  {currentBanner.buttonText || "Shop Now"}
                </span>
                <ArrowRight className="relative size-4 transition-colors duration-500 group-hover/btn:text-white" />
              </Link>
            </motion.div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Controls */}
      {banners.length > 1 && (
        <>
          <div className="absolute bottom-12 left-8 z-10 flex gap-3 sm:left-20">
            {banners.map((_, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setDirection(idx > currentIndex ? 1 : -1);
                  setCurrentIndex(idx);
                }}
                className="group relative h-8 w-6 flex items-center justify-center"
              >
                <div className={cn(
                  "h-1 rounded-full transition-all duration-700 ease-[0.16,1,0.3,1]",
                  idx === currentIndex ? "w-6 bg-[#2f9e74] shadow-[0_0_10px_rgba(47,158,116,0.5)]" : "w-1.5 bg-white/20 group-hover:bg-white/40"
                )} />
              </button>
            ))}
          </div>

          <div className="absolute bottom-12 right-8 z-10 flex gap-3 sm:right-20">
            <button
              onClick={() => paginate(-1)}
              className="grid size-14 place-items-center rounded-full border border-white/10 bg-white/5 text-white backdrop-blur-xl transition-all hover:bg-white/10 hover:scale-110 active:scale-95"
            >
              <ChevronLeft className="size-6" />
            </button>
            <button
              onClick={() => paginate(1)}
              className="grid size-14 place-items-center rounded-full border border-white/10 bg-white/5 text-white backdrop-blur-xl transition-all hover:bg-white/10 hover:scale-110 active:scale-95"
            >
              <ChevronRight className="size-6" />
            </button>
          </div>
        </>
      )}
    </section>
  );
}
