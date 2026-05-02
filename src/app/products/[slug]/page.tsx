import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, PackageCheck, ShieldCheck, ShoppingBag, Truck } from "lucide-react";

import { Button } from "@/components/ui/button";
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
  const product = await getProductBySlug(slug).catch(() => null);

  if (!product || product.status !== "active") {
    notFound();
  }

  return (
    <main className="bg-[#fafaf8] px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <Link
          href="/products"
          className="inline-flex items-center gap-2 text-sm font-semibold text-neutral-600 transition hover:text-neutral-950"
        >
          <ArrowLeft className="size-4" />
          Back to products
        </Link>

        <div className="mt-8 grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-start">
          <section className="overflow-hidden rounded-[2.25rem] border border-neutral-200 bg-white p-3 shadow-sm">
            <div className="relative aspect-[4/3] overflow-hidden rounded-[1.75rem] bg-[#f6f4ee]">
              {product.imageUrl ? (
                <Image
                  src={product.imageUrl}
                  alt={product.name}
                  fill
                  priority
                  sizes="(min-width: 1024px) 52vw, 100vw"
                  className="object-cover"
                />
              ) : (
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_35%_25%,rgba(47,158,116,0.26),transparent_36%),linear-gradient(135deg,#f8faf8,#ece8de_48%,#f7f7f3)]" />
              )}
            </div>
          </section>

          <section className="rounded-[2.25rem] border border-neutral-200 bg-white p-6 shadow-sm">
            <div className="flex flex-wrap gap-2">
              <span className="rounded-full bg-[#f6f4ee] px-3 py-1 text-sm font-semibold text-neutral-700">
                {product.category}
              </span>
              <span className="rounded-full bg-[#2f9e74]/10 px-3 py-1 text-sm font-semibold text-[#257a5a]">
                {product.stock > 0 ? `${product.stock} in stock` : "Out of stock"}
              </span>
            </div>

            <h1 className="mt-5 text-4xl font-semibold tracking-normal text-neutral-950 sm:text-5xl">
              {product.name}
            </h1>
            <p className="mt-4 text-2xl font-semibold text-neutral-800">
              ৳{product.price.toLocaleString("en-BD")}
            </p>
            <p className="mt-5 text-base leading-8 text-neutral-600">
              {product.description}
            </p>

            {product.tags.length > 0 ? (
              <div className="mt-6 flex flex-wrap gap-2">
                {product.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full border border-neutral-200 px-3 py-1 text-xs font-semibold text-neutral-600"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            ) : null}

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button type="button" disabled={product.stock <= 0}>
                <ShoppingBag className="size-4" />
                Add to cart
              </Button>
              <Button type="button" variant="secondary">
                Buy now
              </Button>
            </div>

            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              {[
                { icon: Truck, label: "Fast delivery" },
                { icon: ShieldCheck, label: "Quality checked" },
                { icon: PackageCheck, label: "COD ready" },
              ].map((item) => (
                <div
                  key={item.label}
                  className="rounded-2xl bg-[#f6f4ee] p-4 text-sm font-semibold text-neutral-700"
                >
                  <item.icon className="mb-3 size-5 text-[#2f9e74]" />
                  {item.label}
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
