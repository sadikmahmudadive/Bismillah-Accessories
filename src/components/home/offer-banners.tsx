"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Sparkles, ArrowRight } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import type { OfferBanner } from "@/types/domain";

export function OfferBanners() {
  const [banners, setBanners] = useState<OfferBanner[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [direction, setDirection] = useState(0);

  useEffect(() => {
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
    return <div className="h-[300px] w-full animate-pulse rounded-[2.5rem] bg-neutral-100 sm:h-[450px]" />;
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
    <section className="relative group overflow-hidden rounded-[2.5rem] bg-neutral-950 shadow-2xl sm:aspect-[21/9]">
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
          className="absolute inset-0"
        >
          {/* Background Image */}
          <div className="absolute inset-0">
            <img 
              src={currentBanner.imageUrl} 
              alt={currentBanner.title}
              className="h-full w-full object-cover opacity-60 transition-transform duration-[10s] ease-linear scale-110 group-hover:scale-100"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-neutral-950 via-neutral-950/40 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/80 via-transparent to-transparent" />
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
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="mt-6 max-w-2xl text-4xl font-black leading-tight text-white sm:text-6xl"
            >
              {currentBanner.title}
            </motion.h2>
            
            {currentBanner.subtitle && (
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="mt-4 max-w-lg text-lg font-medium text-white/70"
              >
                {currentBanner.subtitle}
              </motion.p>
            )}

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="mt-10"
            >
              <Link 
                href={currentBanner.link || "/products"}
                className="inline-flex items-center gap-3 rounded-full bg-[#2f9e74] px-10 py-4 text-sm font-black text-white shadow-xl shadow-[#2f9e74]/30 transition-all hover:scale-105 hover:bg-[#1a6b4a]"
              >
                {currentBanner.buttonText || "Shop Now"}
                <ArrowRight className="size-4" />
              </Link>
            </motion.div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Controls */}
      {banners.length > 1 && (
        <>
          <div className="absolute bottom-10 left-8 z-10 flex gap-2 sm:left-20">
            {banners.map((_, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setDirection(idx > currentIndex ? 1 : -1);
                  setCurrentIndex(idx);
                }}
                className={cn(
                  "h-1 rounded-full transition-all duration-500",
                  idx === currentIndex ? "w-10 bg-[#2f9e74]" : "w-4 bg-white/20"
                )}
              />
            ))}
          </div>

          <div className="absolute bottom-10 right-8 z-10 flex gap-3 sm:right-20">
            <button
              onClick={() => paginate(-1)}
              className="grid size-12 place-items-center rounded-full bg-white/10 text-white backdrop-blur-md transition hover:bg-white/20"
            >
              <ChevronLeft className="size-5" />
            </button>
            <button
              onClick={() => paginate(1)}
              className="grid size-12 place-items-center rounded-full bg-white/10 text-white backdrop-blur-md transition hover:bg-white/20"
            >
              <ChevronRight className="size-5" />
            </button>
          </div>
        </>
      )}
    </section>
  );
}
