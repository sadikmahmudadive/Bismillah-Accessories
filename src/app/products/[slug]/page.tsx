import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, PackageCheck, ShieldCheck, Truck } from "lucide-react";
import * as motion from "framer-motion/client";

import { AddToCartSection } from "@/components/product/add-to-cart-section";
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
    <main className="bg-[#fafaf8] px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
        >
          <Link
            href="/products"
            className="inline-flex items-center gap-2 text-sm font-semibold text-neutral-600 transition hover:text-neutral-950"
          >
            <ArrowLeft className="size-4" />
            Back to products
          </Link>
        </motion.div>

        <div className="mt-8 grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-start">
          {/* Left: Image */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="overflow-hidden rounded-[2.25rem] border border-neutral-200 bg-white p-3 shadow-sm lg:sticky lg:top-24"
          >
            <div className="relative aspect-[4/3] overflow-hidden rounded-[1.75rem] bg-[#f6f4ee]">
              {product.imageUrl ? (
                <Image
                  src={product.imageUrl}
                  alt={product.name}
                  fill
                  priority
                  sizes="(min-width: 1024px) 52vw, 100vw"
                  className="object-cover transition duration-700 hover:scale-105"
                />
              ) : (
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_35%_25%,rgba(47,158,116,0.26),transparent_36%),linear-gradient(135deg,#f8faf8,#ece8de_48%,#f7f7f3)]" />
              )}
            </div>
          </motion.section>

          {/* Right: Details */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="rounded-[2.25rem] border border-neutral-200 bg-white p-6 shadow-sm sm:p-8"
          >
            <div className="flex flex-wrap gap-2">
              <span className="rounded-full bg-[#f6f4ee] px-3 py-1 text-sm font-semibold text-neutral-700">
                {product.category}
              </span>
              <span
                className={`rounded-full px-3 py-1 text-sm font-semibold ${
                  product.stock > 0
                    ? "bg-[#2f9e74]/10 text-[#257a5a]"
                    : "bg-red-50 text-red-600"
                }`}
              >
                {product.stock > 0 ? `${product.stock} in stock` : "Out of stock"}
              </span>
            </div>

            <h1 className="mt-5 text-4xl font-semibold tracking-tight text-neutral-950 sm:text-5xl">
              {product.name}
            </h1>
            <p className="mt-4 text-3xl font-semibold text-neutral-900">
              ৳{product.price.toLocaleString("en-BD")}
            </p>

            <div className="my-8 h-px bg-neutral-100" />

            <div className="prose prose-neutral max-w-none">
              <h2 className="text-sm font-bold uppercase tracking-wider text-neutral-400">
                Product Description
              </h2>
              <p className="mt-3 text-base leading-8 text-neutral-600">
                {product.description}
              </p>
            </div>

            {product.tags.length > 0 ? (
              <div className="mt-6 flex flex-wrap gap-2">
                {product.tags.map((tag: string) => (
                  <span
                    key={tag}
                    className="rounded-full border border-neutral-200 px-3 py-1 text-xs font-semibold text-neutral-500"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            ) : null}

            <div className="mt-10">
              <AddToCartSection product={product} />
            </div>

            <div className="mt-10 grid gap-3 sm:grid-cols-3">
              {[
                { icon: Truck, label: "Fast delivery" },
                { icon: ShieldCheck, label: "Quality checked" },
                { icon: PackageCheck, label: "COD ready" },
              ].map((item) => (
                <div
                  key={item.label}
                  className="rounded-2xl bg-[#f6f4ee] p-4 text-center transition hover:bg-[#f0eee4]"
                >
                  <item.icon className="mx-auto mb-3 size-5 text-[#2f9e74]" />
                  <p className="text-xs font-bold text-neutral-700">
                    {item.label}
                  </p>
                </div>
              ))}
            </div>
          </motion.section>
        </div>

        {/* Related Products */}
        <RelatedProducts 
          currentProductId={product.id} 
          category={product.category} 
        />
      </div>
    </main>
  );
}
