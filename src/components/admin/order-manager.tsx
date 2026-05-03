"use client";

import { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ReceiptText, 
  RefreshCw, 
  Search, 
  ChevronDown, 
  ChevronUp, 
  User, 
  MapPin, 
  Phone, 
  CreditCard, 
  Banknote,
  Package,
  DollarSign,
  TrendingUp,
  Clock,
  X
} from "lucide-react";

import { useAuth } from "@/components/auth/auth-provider";
import { Button } from "@/components/ui/button";
import type { Order, OrderStatus } from "@/types/domain";
import { cn } from "@/lib/utils";

const STATUS_LABELS: Record<OrderStatus, { label: string; color: string; bg: string }> = {
  pending: { label: "Pending", color: "text-[#b8860b]", bg: "bg-[#b8860b]/10" },
  confirmed: { label: "Confirmed", color: "text-[#257a5a]", bg: "bg-[#2f9e74]/10" },
  processing: { label: "Processing", color: "text-blue-700", bg: "bg-blue-50" },
  shipped: { label: "Shipped", color: "text-purple-700", bg: "bg-purple-50" },
  delivered: { label: "Delivered", color: "text-[#1e6b4a]", bg: "bg-[#2f9e74]/15" },
  cancelled: { label: "Cancelled", color: "text-[#8f3434]", bg: "bg-[#d65f5f]/10" },
};

const STATUS_OPTIONS: (OrderStatus | "all")[] = ["all", "pending", "confirmed", "processing", "shipped", "delivered", "cancelled"];

export function OrderManager() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);
  
  // UI State
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "all">("all");
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);

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
      if (!res.ok || !payload.success) throw new Error(payload.error || "Failed to load orders");
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
      if (!res.ok) throw new Error("Update failed");
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
    } catch (err) {
      setError("Failed to update status");
    } finally {
      setUpdatingOrderId(null);
    }
  }

  const filteredOrders = useMemo(() => {
    return orders.filter(order => {
      const matchesSearch = 
        order.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.phone.includes(searchQuery);
      
      const matchesStatus = statusFilter === "all" || order.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    });
  }, [orders, searchQuery, statusFilter]);

  const stats = useMemo(() => {
    const totalRevenue = orders.reduce((sum, o) => o.status !== "cancelled" ? sum + o.total : sum, 0);
    const pendingOrders = orders.filter(o => o.status === "pending").length;
    return { totalRevenue, pendingOrders, totalOrders: orders.length };
  }, [orders]);

  return (
    <div className="grid gap-6">
      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard 
          icon={DollarSign} 
          label="Total Revenue" 
          value={`৳${stats.totalRevenue.toLocaleString()}`} 
          sub="Excluding cancelled"
          color="text-[#2f9e74]"
          bg="bg-[#2f9e74]/10"
        />
        <StatCard 
          icon={TrendingUp} 
          label="Total Orders" 
          value={stats.totalOrders} 
          sub="Last 200 orders"
          color="text-neutral-900"
          bg="bg-neutral-100"
        />
        <StatCard 
          icon={Clock} 
          label="Pending Action" 
          value={stats.pendingOrders} 
          sub="Needs confirmation"
          color="text-[#b8860b]"
          bg="bg-[#b8860b]/10"
        />
      </div>

      <div className="rounded-[2.5rem] border border-neutral-200 bg-white p-6 shadow-sm overflow-hidden">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-[#f6f4ee] px-3 py-1 text-sm font-semibold text-neutral-700">
              <ReceiptText className="size-4 text-[#2f9e74]" />
              Order Dashboard
            </div>
            <h2 className="mt-4 text-2xl font-semibold text-neutral-950">Customer Orders</h2>
          </div>
          
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[240px]">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-neutral-400" />
              <input 
                type="text"
                placeholder="Search by name, ID, or phone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-10 w-full rounded-full border border-neutral-200 bg-[#fafaf8] pl-10 pr-4 text-sm font-medium outline-none focus:border-neutral-950"
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-950"
                >
                  <X className="size-3" />
                </button>
              )}
            </div>
            <Button variant="secondary" onClick={loadOrders} disabled={isLoading}>
              <RefreshCw className={cn("size-4", isLoading && "animate-spin")} />
              <span className="hidden sm:inline">Refresh</span>
            </Button>
          </div>
        </div>

        {/* Status Filters */}
        <div className="mt-6 flex flex-wrap gap-2">
          {STATUS_OPTIONS.map(opt => (
            <button
              key={opt}
              onClick={() => setStatusFilter(opt)}
              className={cn(
                "rounded-full px-4 py-1.5 text-xs font-bold transition-all",
                statusFilter === opt 
                  ? "bg-neutral-950 text-white shadow-lg shadow-neutral-950/20" 
                  : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
              )}
            >
              {opt === "all" ? "All Orders" : STATUS_LABELS[opt].label}
            </button>
          ))}
        </div>

        {error && (
          <div className="mt-6 rounded-2xl bg-[#d65f5f]/10 p-4 text-sm font-semibold text-[#8f3434]">
            {error}
          </div>
        )}

        <div className="mt-8">
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map(i => <div key={i} className="h-24 w-full animate-pulse rounded-3xl bg-neutral-100" />)}
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="rounded-[2rem] border border-dashed border-neutral-300 py-16 text-center">
              <p className="text-sm font-semibold text-neutral-500">No orders found matching your criteria.</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {filteredOrders.map(order => (
                <OrderRow 
                  key={order.id} 
                  order={order} 
                  isExpanded={expandedOrder === order.id}
                  onToggle={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
                  onStatusUpdate={updateOrderStatus}
                  isUpdating={updatingOrderId === order.id}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, sub, color, bg }: any) {
  return (
    <div className="rounded-[2.5rem] border border-neutral-200 bg-white p-5 shadow-sm">
      <div className={cn("grid size-10 place-items-center rounded-full mb-4", bg, color)}>
        <Icon className="size-5" />
      </div>
      <p className="text-xs font-bold uppercase tracking-wider text-neutral-400">{label}</p>
      <p className="mt-1 text-2xl font-bold text-neutral-950">{value}</p>
      <p className="mt-1 text-xs text-neutral-500">{sub}</p>
    </div>
  );
}

function OrderRow({ order, isExpanded, onToggle, onStatusUpdate, isUpdating }: any) {
  const dateStr = typeof order.createdAt === 'string' 
    ? new Date(order.createdAt).toLocaleString("en-BD", {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      }) 
    : (order.createdAt as any)?.toDate?.()?.toLocaleString() || "Unknown";

  return (
    <motion.div 
      layout
      className={cn(
        "group overflow-hidden rounded-[2rem] border border-neutral-200 transition-all",
        isExpanded ? "bg-white shadow-xl ring-1 ring-neutral-950/5 border-neutral-300" : "bg-white hover:border-neutral-300"
      )}
    >
      <div 
        onClick={onToggle}
        className="flex cursor-pointer items-center justify-between p-4"
      >
        <div className="flex min-w-0 items-center gap-4">
          <div className={cn(
            "hidden size-12 place-items-center rounded-2xl sm:grid transition-colors",
            isExpanded ? "bg-neutral-950 text-white" : "bg-neutral-100 text-neutral-400 group-hover:bg-neutral-200"
          )}>
            <User className="size-5" />
          </div>
          <div className="min-w-0">
            <h4 className="truncate text-sm font-bold text-neutral-950">{order.customerName}</h4>
            <div className="mt-0.5 flex flex-wrap items-center gap-2 text-xs">
              <span className="font-mono text-neutral-400">#{order.id.slice(-6).toUpperCase()}</span>
              <span className="text-neutral-300">•</span>
              <span className="font-semibold text-neutral-600">৳{order.total.toLocaleString()}</span>
              <span className="text-neutral-300">•</span>
              <span className={cn("rounded-full px-2 py-0.5 font-bold", STATUS_LABELS[order.status as OrderStatus].bg, STATUS_LABELS[order.status as OrderStatus].color)}>
                {STATUS_LABELS[order.status as OrderStatus].label}
              </span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <span className="hidden text-xs font-medium text-neutral-400 lg:block">{dateStr}</span>
          <div className={cn(
            "grid size-8 place-items-center rounded-full transition-all",
            isExpanded ? "bg-neutral-950 text-white" : "bg-neutral-100 text-neutral-500 group-hover:bg-neutral-200"
          )}>
            {isExpanded ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-neutral-100"
          >
            <div className="grid gap-6 p-6 md:grid-cols-2">
              {/* Items List */}
              <div className="space-y-4">
                <h5 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-neutral-400">
                  <Package className="size-3.5" /> Ordered Items
                </h5>
                <div className="space-y-2">
                  {order.items.map((item: any, i: number) => (
                    <div key={i} className="flex items-center justify-between rounded-xl bg-[#fafaf8] p-3 text-sm">
                      <div className="flex items-center gap-3">
                        <span className="grid size-6 place-items-center rounded-full bg-neutral-200 text-[10px] font-bold">{item.quantity}</span>
                        <div className="flex flex-col">
                          <span className="font-medium text-neutral-900">{item.name}</span>
                          {item.variantName && <span className="text-[10px] font-bold text-neutral-400 uppercase">{item.variantName}</span>}
                        </div>
                      </div>
                      <span className="font-bold text-neutral-600">৳{(item.price * item.quantity).toLocaleString()}</span>
                    </div>
                  ))}
                  <div className="flex justify-between p-3 text-sm font-bold text-neutral-950">
                    <span>Total Bill (inc. delivery)</span>
                    <span className="text-[#2f9e74]">৳{order.total.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Delivery & Payment */}
              <div className="space-y-6">
                <div>
                  <h5 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-neutral-400">
                    <MapPin className="size-3.5" /> Shipping Address
                  </h5>
                  <div className="mt-3 space-y-1.5 text-sm">
                    <p className="flex items-center gap-2 font-semibold text-neutral-900">
                      <User className="size-3.5 text-neutral-400" /> {order.customerName}
                    </p>
                    <p className="flex items-center gap-2 text-neutral-600">
                      <Phone className="size-3.5 text-neutral-400" /> {order.phone}
                    </p>
                    <p className="flex items-start gap-2 text-neutral-600 leading-relaxed">
                      <MapPin className="size-3.5 mt-0.5 text-neutral-400" /> {order.address}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h5 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-neutral-400">
                      <CreditCard className="size-3.5" /> Payment
                    </h5>
                    <div className="mt-3 flex items-center gap-2 text-sm font-bold text-neutral-900">
                      {order.paymentMethod === "bkash_mock" ? (
                        <>
                          <span className="text-[#e2136e]">bKash</span>
                          {order.bkashTransactionId && (
                            <span className="rounded-md bg-neutral-100 px-1.5 py-0.5 font-mono text-[10px] uppercase">{order.bkashTransactionId}</span>
                          )}
                        </>
                      ) : (
                        <span className="text-[#b8860b]">Cash on Delivery</span>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <h5 className="text-xs font-bold uppercase tracking-wider text-neutral-400">Order Action</h5>
                    <div className="mt-2">
                      <select
                        disabled={isUpdating}
                        value={order.status}
                        onChange={(e) => onStatusUpdate(order.id, e.target.value as OrderStatus)}
                        className="h-10 w-full rounded-xl border border-neutral-200 bg-neutral-50 px-3 text-sm font-bold outline-none transition focus:border-neutral-950 disabled:opacity-50"
                      >
                        {STATUS_OPTIONS.filter(o => o !== "all").map((status: any) => (
                          <option key={status} value={status}>
                            {STATUS_LABELS[status as OrderStatus].label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
