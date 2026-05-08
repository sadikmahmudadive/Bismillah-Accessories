"use client";

import Image from "next/image";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

export function ProductGallery({
  mainImage,
  gallery,
  productName,
}: {
  mainImage: string;
  gallery: string[];
  productName: string;
}) {
  const [activeImage, setActiveImage] = useState(mainImage);
  const hasGallery = gallery && gallery.length > 0;
  
  // Create an array of all images, ensuring mainImage is first and no duplicates
  const allImages = hasGallery 
    ? [mainImage, ...gallery.filter(img => img !== mainImage)]
    : [mainImage];

  return (
    <div className="flex w-full flex-col gap-8 lg:flex-row-reverse lg:items-start lg:gap-10">
      {/* Main Image Viewport */}
      <div className="relative aspect-square w-full flex-1 overflow-hidden rounded-[2.5rem] bg-[#fcfcfc] transition-all duration-700 hover:shadow-[inset_0_0_60px_rgba(0,0,0,0.03)] lg:aspect-auto lg:h-[70vh]">
        {activeImage ? (
          <AnimatePresence mode="wait">
            <motion.div
              key={activeImage}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="absolute inset-0 p-8 sm:p-16"
            >
              <Image
                src={activeImage}
                alt={productName}
                fill
                priority
                sizes="(min-width: 1024px) 45vw, 100vw"
                className="object-contain transition-transform duration-[2s] hover:scale-110"
              />
            </motion.div>
          </AnimatePresence>
        ) : (
          <div className="absolute inset-0 bg-neutral-50" />
        )}
      </div>

      {/* Vertical Thumbnails */}
      {allImages.length > 1 && (
        <div className="flex shrink-0 gap-3 overflow-x-auto pb-4 scrollbar-hide lg:flex-col lg:overflow-x-visible lg:pb-0">
          {allImages.map((img, idx) => (
            <button
              key={idx}
              onClick={() => setActiveImage(img)}
              className={cn(
                "group relative size-20 shrink-0 overflow-hidden rounded-2xl border-2 transition-all duration-300 lg:size-24",
                activeImage === img
                  ? "border-[#2f9e74] bg-white shadow-xl shadow-[#2f9e74]/10"
                  : "border-transparent bg-neutral-50 opacity-60 hover:opacity-100 hover:bg-white"
              )}
            >
              <div className="absolute inset-0 p-3">
                <Image
                  src={img}
                  alt={`${productName} thumbnail ${idx + 1}`}
                  fill
                  sizes="96px"
                  className="object-contain transition-transform duration-500 group-hover:scale-110"
                />
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
