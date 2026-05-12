import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, PackageCheck, ShieldCheck, Truck, Sparkles } from "lucide-react";
import * as motion from "framer-motion/client";

import { cn } from "@/lib/utils";

import { AddToCartSection } from "@/components/product/add-to-cart-section";
import { ProductGallery } from "@/components/product/product-gallery";
import { ProductReviews, StarRating } from "@/components/product/product-reviews";
import { RelatedProducts } from "@/components/product/related-products";
import { getProductBySlug } from "@/lib/products";

export const dynamic = "force-dynamic";

type ProductDetailsPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({
  params,
}: ProductDetailsPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug).catch(() => null);

  if (!product) {
    return {
      title: "Product",
    };
  }

  return {
    title: product.name,
    description: product.description,
  };
}

export default async function ProductDetailsPage({
  params,
}: ProductDetailsPageProps) {
  const { slug } = await params;
  let product = null;
  
  try {
    product = await getProductBySlug(slug);
  } catch (error) {
    console.error(`[ProductDetailsPage] Error fetching product by slug '${slug}':`, error);
  }

  if (!product) {
    console.warn(`[ProductDetailsPage] Product not found for slug: ${slug}`);
    notFound();
  }
  
  if (product.status !== "active") {
    console.warn(`[ProductDetailsPage] Product is not active (status: ${product.status}) for slug: ${slug}`);
    notFound();
  }

  return (
    <main className="relative isolate min-h-screen bg-white text-neutral-950">
      {/* ─── Breadcrumb & Navigation ─────────────────────────────── */}
      <div className="absolute left-6 top-6 z-10 sm:left-12 sm:top-12 lg:left-24">
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
        >
          <Link
            href="/products"
            className="group inline-flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-neutral-400 transition hover:text-neutral-950"
          >
            <div className="grid size-8 place-items-center rounded-full border border-neutral-100 bg-white shadow-sm transition group-hover:border-neutral-950 group-hover:bg-neutral-950 group-hover:text-white sm:size-10">
              <ArrowLeft className="size-3.5 sm:size-4" />
            </div>
            <span className="hidden xs:inline">Back to Collection</span>
          </Link>
        </motion.div>
      </div>

      <div className="flex flex-col lg:flex-row">
        {/* Left: Immersive Image Gallery */}
        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
          className="relative w-full lg:min-h-screen lg:w-3/5"
        >
          <div className="flex h-full items-center justify-center bg-[#fdfdfd] p-6 py-24 sm:p-12 lg:p-24">
            <ProductGallery 
              mainImage={product.imageUrl} 
              gallery={product.gallery || []} 
              productName={product.name} 
            />
          </div>
          
          {/* Subtle Branding Watermark */}
          <div className="absolute bottom-12 left-12 hidden lg:block">
            <p className="text-4xl font-[900] tracking-tighter text-neutral-100 select-none">
              BISMILLAH <br /> ACCESSORIES
            </p>
          </div>
        </motion.section>

        {/* Right: Premium Details Showroom */}
        <motion.section
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="relative w-full border-t border-neutral-100 bg-white px-6 py-16 sm:px-12 sm:py-24 lg:min-h-screen lg:w-2/5 lg:border-l lg:border-t-0 lg:px-20 lg:py-32"
        >
          <div className="flex flex-wrap gap-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-neutral-100 bg-neutral-50 px-4 py-1.5 text-[10px] font-black uppercase tracking-widest text-neutral-500">
              <Sparkles className="size-3 text-[#2f9e74]" />
              {product.category}
            </div>
            <div className={cn(
              "inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-[10px] font-black uppercase tracking-widest",
              product.stock > 0
                ? "bg-[#2f9e74]/10 text-[#257a5a]"
                : "bg-red-50 text-red-600"
            )}>
              {product.stock > 0 ? "In Stock" : "Limited Stock"}
            </div>
          </div>

          <h1 className="mt-8 break-words text-4xl font-[900] leading-[1] tracking-tighter text-neutral-950 sm:text-6xl lg:text-7xl">
            {product.name}
          </h1>
          
          <div className="mt-8 flex items-center justify-between">
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <StarRating rating={product.averageRating || 0} readonly size="sm" />
                <span className="text-xs font-black uppercase tracking-widest text-neutral-400">
                  {product.reviewCount || 0} REVIEWS
                </span>
              </div>
              <p className="text-3xl font-[900] tracking-tighter text-neutral-950">
                ৳{product.price.toLocaleString("en-BD")}
              </p>
            </div>
          </div>

          <div className="my-12 h-px bg-neutral-100" />

          <div className="prose prose-neutral max-w-none">
            <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-400">
              The Engineering
            </h2>
            <p className="mt-6 text-lg font-medium leading-relaxed text-neutral-500">
              {product.description}
            </p>
          </div>

          {product.tags.length > 0 ? (
            <div className="mt-10 flex flex-wrap gap-2">
              {product.tags.map((tag: string) => (
                <span
                  key={tag}
                  className="rounded-full border border-neutral-100 px-4 py-1.5 text-[9px] font-black uppercase tracking-widest text-neutral-400 transition hover:border-neutral-950 hover:text-neutral-950"
                >
                  #{tag}
                </span>
              ))}
            </div>
          ) : null}

          <div className="mt-16">
            <AddToCartSection product={product} />
          </div>

          {/* Value Props */}
          <div className="mt-16 grid grid-cols-1 gap-4 sm:grid-cols-3">
            {[
              { icon: Truck, label: "Fast Express" },
              { icon: ShieldCheck, label: "Quality First" },
              { icon: PackageCheck, label: "Secure COD" },
            ].map((item) => (
              <div
                key={item.label}
                className="group flex items-center gap-4 rounded-2xl border border-neutral-100 bg-neutral-50 p-4 transition-all sm:flex-col sm:items-center sm:gap-3 sm:rounded-[2rem] sm:p-6 hover:bg-white hover:shadow-2xl hover:shadow-neutral-950/5"
              >
                <div className="grid size-10 place-items-center rounded-full bg-white text-[#2f9e74] shadow-sm transition sm:size-12 group-hover:bg-neutral-950 group-hover:text-white">
                  <item.icon className="size-4 sm:size-5" />
                </div>
                <p className="text-[9px] font-black uppercase tracking-widest text-neutral-600">
                  {item.label}
                </p>
              </div>
            ))}
          </div>
        </motion.section>
      </div>

      {/* Reviews Section */}
      <section className="bg-white px-6 py-32 sm:px-12 lg:px-24">
        <div className="mx-auto max-w-5xl">
           <ProductReviews productId={product.id} />
        </div>
      </section>

      {/* Related Products */}
      <section className="border-t border-neutral-100 bg-neutral-50 px-6 py-32 sm:px-12 lg:px-24">
        <div className="mx-auto max-w-7xl">
          <RelatedProducts 
            currentProductId={product.id} 
            category={product.category} 
          />
        </div>
      </section>
    </main>
  );
}
