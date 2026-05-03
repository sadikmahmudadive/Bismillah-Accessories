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
    <div className="flex flex-col gap-3">
      {/* Main Image */}
      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-[1.75rem] bg-[#f6f4ee]">
        {activeImage ? (
          <AnimatePresence mode="wait">
            <motion.div
              key={activeImage}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="absolute inset-0"
            >
              <Image
                src={activeImage}
                alt={productName}
                fill
                priority
                sizes="(min-width: 1024px) 52vw, 100vw"
                className="object-cover transition duration-700 hover:scale-105"
              />
            </motion.div>
          </AnimatePresence>
        ) : (
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_35%_25%,rgba(47,158,116,0.26),transparent_36%),linear-gradient(135deg,#f8faf8,#ece8de_48%,#f7f7f3)]" />
        )}
      </div>

      {/* Thumbnails */}
      {allImages.length > 1 && (
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
          {allImages.map((img, idx) => (
            <button
              key={idx}
              onClick={() => setActiveImage(img)}
              className={cn(
                "relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl border-2 transition-all",
                activeImage === img
                  ? "border-neutral-950 opacity-100"
                  : "border-transparent opacity-60 hover:opacity-100"
              )}
            >
              <Image
                src={img}
                alt={`${productName} thumbnail ${idx + 1}`}
                fill
                sizes="80px"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
