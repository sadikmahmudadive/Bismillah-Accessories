"use client";

import Image from "next/image";
import { use, useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Banknote,
  CheckCircle2,
  CreditCard,
  Loader2,
  MapPin,
  PackageCheck,
  Phone,
  ShoppingBag,
} from "lucide-react";

import { useAuth } from "@/components/auth/auth-provider";
import { ButtonLink } from "@/components/ui/button";
import { OrderProducts } from "@/components/product/order-products";
import { OrderStatusTracker } from "@/components/orders/order-status-tracker";
import type { Order } from "@/types/domain";
import { cn } from "@/lib/utils";

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  pending: { label: "Pending", color: "bg-[#b8860b]/10 text-[#7a5c00]" },
  confirmed: { label: "Confirmed", color: "bg-[#2f9e74]/10 text-[#257a5a]" },
  processing: { label: "Processing", color: "bg-blue-50 text-blue-700" },
  shipped: { label: "Shipped", color: "bg-purple-50 text-purple-700" },
  delivered: { label: "Delivered", color: "bg-[#2f9e74]/15 text-[#1e6b4a]" },
  cancelled: { label: "Cancelled", color: "bg-[#d65f5f]/10 text-[#8f3434]" },
};

type PageProps = { params: Promise<{ id: string }> };

export default function OrderConfirmationPage({ params }: PageProps) {
  const { id } = use(params);
  const { user, isLoading: authLoading } = useAuth();
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user || !id) return;
    
    let cancelled = false;

    async function fetchOrder() {
      try {
        const token = await user!.getIdToken();
        const res = await fetch(`/api/orders/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const payload = await res.json();

        if (!res.ok || !payload.success) {
          throw new Error(payload.error || "Order not found.");
        }

        if (!cancelled) setOrder(payload.data as Order);
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : "Failed to load order.");
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    void fetchOrder();
    return () => { cancelled = true; };
  }, [user, id]);

  // Handle auth loading states
  if (authLoading) {
    return (
      <main className="flex min-h-[60vh] items-center justify-center bg-transparent">
        <Loader2 className="size-8 animate-spin text-neutral-400" />
      </main>
    );
  }

  if (!user) {
    return (
      <main className="bg-transparent px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-lg text-center">
          <div className="mx-auto grid size-14 place-items-center rounded-full bg-[#d65f5f]/10 text-[#d65f5f]">
            <ShoppingBag className="size-6" />
          </div>
          <h1 className="mt-5 text-2xl font-semibold text-neutral-950">Sign in required</h1>
          <p className="mt-2 text-sm text-neutral-600">You must be signed in to view this order.</p>
        </div>
      </main>
    );
  }

  if (isLoading) {
    return (
      <main className="flex min-h-[60vh] items-center justify-center bg-transparent">
        <Loader2 className="size-8 animate-spin text-neutral-400" />
      </main>
    );
  }

  if (error || !order) {
    return (
      <main className="bg-transparent px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-lg text-center">
          <div className="mx-auto grid size-14 place-items-center rounded-full bg-[#d65f5f]/10 text-[#d65f5f]">
            <ShoppingBag className="size-6" />
          </div>
          <h1 className="mt-5 text-2xl font-semibold text-neutral-950">Order not found</h1>
          <p className="mt-2 text-sm text-neutral-600">{error || "This order does not exist."}</p>
          <div className="mt-6 flex justify-center gap-3">
            <ButtonLink href="/products">Browse products</ButtonLink>
          </div>
        </div>
      </main>
    );
  }

  const statusMeta = STATUS_LABELS[order.status] ?? { label: order.status, color: "bg-neutral-100 text-neutral-600" };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.05 } },
  };
  const cardVariants = {
    hidden: { opacity: 0, y: 16 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  return (
    <main className="bg-transparent px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8 text-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 20, delay: 0.2 }}
            className="mx-auto mb-4 grid size-16 place-items-center rounded-full bg-[#2f9e74]/10 text-[#2f9e74]"
          >
            <CheckCircle2 className="size-8" />
          </motion.div>
          <h1 className="text-3xl font-semibold text-neutral-950 sm:text-4xl">Order placed!</h1>
          <p className="mt-2 text-sm text-neutral-600">
            Thank you, <strong>{order.customerName}</strong>. We received your order.
          </p>
          <div className="mt-3 flex items-center justify-center gap-2">
            <span className="text-xs font-semibold text-neutral-400">Order ID:</span>
            <code className="rounded-lg bg-neutral-100 px-2 py-0.5 text-xs font-mono text-neutral-700">
              {id}
            </code>
          </div>

          <div className="mt-8 overflow-x-auto pb-4">
            <div className="min-w-[600px] px-4">
              <OrderStatusTracker status={order.status as any} />
            </div>
          </div>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid gap-5 lg:grid-cols-[1fr_0.48fr]"
        >
          {/* Items */}
          <motion.section
            variants={cardVariants}
            className="rounded-[2rem] border border-neutral-200 bg-white p-5 shadow-sm"
          >
            <div className="inline-flex items-center gap-2 rounded-full bg-[#f6f4ee] px-3 py-1 text-sm font-semibold text-neutral-700">
              <PackageCheck className="size-4 text-[#2f9e74]" />
              Items ordered
            </div>

            <div className="mt-5 grid gap-3">
              {order.items.map((item, idx) => (
                <div
                  key={`${item.productId}-${idx}`}
                  className="flex items-center gap-3 rounded-[1.35rem] border border-neutral-100 bg-[#fafaf8] p-3"
                >
                  <div className="relative size-14 shrink-0 overflow-hidden rounded-2xl bg-neutral-200">
                    {item.imageUrl && (
                      <Image
                        src={item.imageUrl}
                        alt={item.name}
                        fill
                        sizes="56px"
                        className="object-cover"
                      />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="truncate text-sm font-semibold text-neutral-950">
                      {item.name} {item.variantName ? `(${item.variantName})` : ""}
                    </p>
                    <p className="text-xs text-neutral-500">Qty: {item.quantity}</p>
                  </div>
                  <p className="text-sm font-semibold text-neutral-800 shrink-0">
                    ৳{(item.price * item.quantity).toLocaleString("en-BD")}
                  </p>
                </div>
              ))}
            </div>

            {/* Totals */}
            <div className="mt-5 grid gap-2 rounded-2xl bg-[#f6f4ee] p-4 text-sm text-neutral-700">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-semibold">৳{order.subtotal.toLocaleString("en-BD")}</span>
              </div>
              <div className="flex justify-between">
                <span>Delivery fee</span>
                <span className="font-semibold">৳{order.deliveryFee.toLocaleString("en-BD")}</span>
              </div>
              <div className="mt-1 flex justify-between border-t border-neutral-200 pt-2 text-base font-semibold text-neutral-950">
                <span>Total paid</span>
                <span>৳{order.total.toLocaleString("en-BD")}</span>
              </div>
            </div>
          </motion.section>

          {/* Delivery + Payment details */}
          <div className="grid gap-5 content-start">
            <motion.section
              variants={cardVariants}
              className="rounded-[2rem] border border-neutral-200 bg-white p-5 shadow-sm"
            >
              <div className="inline-flex items-center gap-2 rounded-full bg-[#f6f4ee] px-3 py-1 text-sm font-semibold text-neutral-700">
                <MapPin className="size-4 text-[#2f9e74]" />
                Delivery details
              </div>
              <div className="mt-4 grid gap-2 text-sm text-neutral-600">
                <p>
                  <span className="font-semibold text-neutral-950">{order.customerName}</span>
                </p>
                <p className="flex items-center gap-1.5">
                  <Phone className="size-3.5 shrink-0" />
                  {order.phone}
                </p>
                <p className="leading-6">{order.address}</p>
              </div>
            </motion.section>

            <motion.section
              variants={cardVariants}
              className="rounded-[2rem] border border-neutral-200 bg-white p-5 shadow-sm"
            >
              <div className="inline-flex items-center gap-2 rounded-full bg-[#f6f4ee] px-3 py-1 text-sm font-semibold text-neutral-700">
                {order.paymentMethod === "bkash_mock" ? (
                  <CreditCard className="size-4 text-[#e2136e]" />
                ) : (
                  <Banknote className="size-4 text-[#b8860b]" />
                )}
                Payment
              </div>
              <p className="mt-3 text-sm font-semibold text-neutral-950">
                {order.paymentMethod === "bkash_mock" ? "bKash (simulated)" : "Cash on Delivery"}
              </p>
              {order.bkashTransactionId && (
                <p className="mt-1 text-xs text-neutral-500">
                  Trx ID:{" "}
                  <code className="font-mono text-neutral-700">{order.bkashTransactionId}</code>
                </p>
              )}
            </motion.section>

            <motion.div variants={cardVariants} className="flex flex-col gap-3">
              <ButtonLink href="/products" variant="secondary" className="w-full">
                Continue shopping
              </ButtonLink>
            </motion.div>
          </div>
        </motion.div>

        {/* More Products Section */}
        <div className="mt-16">
          <OrderProducts />
        </div>
      </div>
    </main>
  );
}
