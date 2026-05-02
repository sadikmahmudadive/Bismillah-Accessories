"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ReceiptText, RefreshCw } from "lucide-react";

import { useAuth } from "@/components/auth/auth-provider";
import { Button } from "@/components/ui/button";
import type { Order, OrderStatus } from "@/types/domain";
import { cn } from "@/lib/utils";

const STATUS_LABELS: Record<OrderStatus, { label: string; color: string }> = {
  pending: { label: "Pending", color: "bg-[#b8860b]/10 text-[#7a5c00] border-[#b8860b]/20" },
  confirmed: { label: "Confirmed", color: "bg-[#2f9e74]/10 text-[#257a5a] border-[#2f9e74]/20" },
  processing: { label: "Processing", color: "bg-blue-50 text-blue-700 border-blue-200" },
  shipped: { label: "Shipped", color: "bg-purple-50 text-purple-700 border-purple-200" },
  delivered: { label: "Delivered", color: "bg-[#2f9e74]/15 text-[#1e6b4a] border-[#2f9e74]/25" },
  cancelled: { label: "Cancelled", color: "bg-[#d65f5f]/10 text-[#8f3434] border-[#d65f5f]/20" },
};

const STATUS_OPTIONS: OrderStatus[] = ["pending", "confirmed", "processing", "shipped", "delivered", "cancelled"];

export function OrderManager() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);

  useEffect(() => {
    if (user) void loadOrders();
  }, [user]);

  async function loadOrders() {
    if (!user) return;

    setIsLoading(true);
    setError(null);

    try {
      const token = await user.getIdToken();
      const res = await fetch("/api/orders", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const payload = await res.json();

      if (!res.ok || !payload.success) {
        throw new Error(payload.error || "Failed to load orders");
      }

      setOrders(payload.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load orders");
    } finally {
      setIsLoading(false);
    }
  }

  async function updateOrderStatus(orderId: string, newStatus: OrderStatus) {
    if (!user) return;

    setUpdatingOrderId(orderId);
    setError(null);

    try {
      const token = await user.getIdToken();
      const res = await fetch(`/api/orders/${orderId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });
      const payload = await res.json();

      if (!res.ok || !payload.success) {
        throw new Error(payload.error || "Failed to update order");
      }

      // Update local state
      setOrders((prev) =>
        prev.map((order) =>
          order.id === orderId ? { ...order, status: newStatus } : order
        )
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update order");
    } finally {
      setUpdatingOrderId(null);
    }
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.05 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 16 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.45 } },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="rounded-[2rem] border border-neutral-200 bg-white p-6 shadow-sm"
    >
      <div className="flex items-center justify-between">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-[#f6f4ee] px-3 py-1 text-sm font-semibold text-neutral-700">
            <ReceiptText className="size-4 text-[#2f9e74]" />
            Order management
          </div>
          <h2 className="mt-4 text-2xl font-semibold text-neutral-950">
            Process orders
          </h2>
          <p className="mt-2 text-sm text-neutral-600">
            View and update order statuses. {orders.length} total orders.
          </p>
        </div>
        <Button
          type="button"
          variant="secondary"
          onClick={() => void loadOrders()}
          disabled={isLoading}
        >
          <RefreshCw className={cn("size-4", isLoading && "animate-spin")} />
          Refresh
        </Button>
      </div>

      {error && (
        <div className="mt-4 rounded-2xl border border-[#d65f5f]/25 bg-[#d65f5f]/10 px-4 py-3 text-sm font-medium text-[#8f3434]">
          {error}
        </div>
      )}

      <div className="mt-6">
        {isLoading ? (
          <div className="grid gap-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="rounded-2xl border border-neutral-200 bg-[#f6f4ee] p-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <div className="h-4 w-32 rounded-full bg-neutral-200 animate-pulse" />
                    <div className="h-3 w-48 rounded-full bg-neutral-200 animate-pulse" />
                  </div>
                  <div className="h-8 w-24 rounded-full bg-neutral-200 animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        ) : orders.length === 0 ? (
          <div className="rounded-[2rem] border border-dashed border-neutral-300 bg-[#fafaf8] p-8 text-center">
            <p className="text-sm font-semibold text-neutral-600">No orders yet.</p>
          </div>
        ) : (
          <div className="grid gap-3">
            {orders.map((order) => (
              <motion.article
                key={order.id}
                variants={itemVariants}
                className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <h3 className="text-sm font-semibold text-neutral-950">
                        {order.customerName}
                      </h3>
                      <span className={cn("rounded-full border px-2 py-0.5 text-xs font-semibold", STATUS_LABELS[order.status].color)}>
                        {STATUS_LABELS[order.status].label}
                      </span>
                    </div>

                    <div className="grid gap-1 text-xs text-neutral-500">
                      <p>
                        <strong>ID:</strong>{" "}
                        <code className="font-mono text-neutral-700">{order.id}</code>
                      </p>
                      <p>
                        <strong>Items:</strong> {order.items.length} × ৳{order.total.toLocaleString("en-BD")}
                      </p>
                      <p>
                        <strong>Payment:</strong> {order.paymentMethod === "bkash_mock" ? "bKash" : "COD"}
                        {order.bkashTransactionId && ` (${order.bkashTransactionId})`}
                      </p>
                      <p>
                        <strong>Date:</strong>{" "}
                        {(order.createdAt as any)?.toDate?.()?.toLocaleDateString("en-BD", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>

                  <div className="shrink-0">
                    <select
                      value={order.status}
                      onChange={(e) => void updateOrderStatus(order.id, e.target.value as OrderStatus)}
                      disabled={updatingOrderId === order.id}
                      className="rounded-full border border-neutral-200 bg-[#f6f4ee] px-3 py-1 text-xs font-semibold text-neutral-700 outline-none transition focus:border-neutral-950 disabled:opacity-50"
                    >
                      {STATUS_OPTIONS.map((status) => (
                        <option key={status} value={status}>
                          {STATUS_LABELS[status].label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </motion.article>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}
