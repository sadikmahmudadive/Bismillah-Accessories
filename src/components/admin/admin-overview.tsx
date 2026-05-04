"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { 
  TrendingUp, 
  ShoppingBag, 
  Users, 
  Package, 
  ArrowUpRight, 
  ArrowDownRight,
  Clock,
  CheckCircle2,
  AlertCircle,
  Truck
} from "lucide-react";
import { useAuth } from "@/components/auth/auth-provider";
import { cn } from "@/lib/utils";

type AnalyticsData = {
  stats: {
    totalRevenue: number;
    totalOrders: number;
    completedOrders: number;
    totalProducts: number;
    totalUsers: number;
    totalReviews: number;
    lowStockCount: number;
  };
  recentOrders: Array<{
    id: string;
    customerName: string;
    total: number;
    status: string;
    createdAt: string;
  }>;
  statusCounts: Record<string, number>;
  lowStockProducts: Array<{
    id: string;
    name: string;
    stock: number;
    category?: string;
    imageUrl?: string;
  }>;
};

export function AdminOverview() {
  const { user } = useAuth();
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadAnalytics() {
      if (!user) return;
      try {
        const token = await user.getIdToken();
        const res = await fetch("/api/admin/analytics", {
          headers: { Authorization: `Bearer ${token}` }
        });
        const payload = await res.json();
        if (res.ok) setData(payload.data);
      } catch (err) {
        console.error("Failed to load analytics", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadAnalytics();
  }, [user]);

  if (isLoading) {
    return (
      <div className="grid gap-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-32 animate-pulse rounded-[2rem] bg-neutral-100" />
          ))}
        </div>
        <div className="h-96 animate-pulse rounded-[2rem] bg-neutral-100" />
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="grid gap-8">
      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard 
          title="Total Revenue" 
          value={`৳${data.stats.totalRevenue.toLocaleString()}`}
          icon={TrendingUp}
          trend="+12.5%"
          trendUp={true}
          color="bg-emerald-500"
        />
        <StatCard 
          title="Total Orders" 
          value={data.stats.totalOrders}
          icon={ShoppingBag}
          trend="+5.2%"
          trendUp={true}
          color="bg-blue-500"
        />
        <StatCard 
          title="Total Users" 
          value={data.stats.totalUsers}
          icon={Users}
          trend="+8.1%"
          trendUp={true}
          color="bg-purple-500"
        />
        <StatCard 
          title="Inventory Alert" 
          value={data.stats.lowStockCount || 0}
          icon={AlertCircle}
          trend={data.stats.lowStockCount > 0 ? "Critical" : "Good"}
          trendUp={false}
          color={data.stats.lowStockCount > 0 ? "bg-red-500" : "bg-amber-500"}
        />
      </div>

      {/* Low Stock Alerts */}
      {data.lowStockProducts && data.lowStockProducts.length > 0 && (
        <section className="rounded-[2.5rem] border border-[#d65f5f]/20 bg-[#d65f5f]/5 p-8 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="grid size-10 place-items-center rounded-full bg-[#d65f5f] text-white shadow-lg shadow-[#d65f5f]/20">
              <AlertCircle className="size-5" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-[#8f3434]">Inventory Alerts</h3>
              <p className="text-sm font-medium text-[#8f3434]/70">The following products are running low on stock and may need restocking soon.</p>
            </div>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {data.lowStockProducts.map((product) => (
              <div key={product.id} className="flex items-center gap-4 rounded-2xl border border-[#d65f5f]/10 bg-white p-4 shadow-sm">
                <div className="relative size-12 overflow-hidden rounded-xl bg-neutral-100">
                  {product.imageUrl && <img src={product.imageUrl} alt={product.name} className="h-full w-full object-cover" />}
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="truncate text-sm font-bold text-neutral-900">{product.name}</h4>
                  <div className="mt-1 flex items-center gap-2">
                    <span className={cn(
                      "rounded-full px-2 py-0.5 text-[10px] font-black uppercase tracking-wider",
                      product.stock === 0 ? "bg-red-100 text-red-600" : "bg-amber-100 text-amber-600"
                    )}>
                      {product.stock === 0 ? "Out of stock" : `${product.stock} units left`}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      <div className="grid gap-8 lg:grid-cols-[1fr_0.4fr]">
        {/* Recent Orders */}
        <section className="rounded-[2.5rem] border border-neutral-200 bg-white p-8 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-neutral-950">Recent Activity</h3>
            <button className="text-sm font-bold text-neutral-500 hover:text-neutral-950 underline underline-offset-4">View All</button>
          </div>

          <div className="mt-8 overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-neutral-100 text-[11px] font-bold uppercase tracking-widest text-neutral-400">
                  <th className="pb-4 pr-4">Order ID</th>
                  <th className="pb-4 pr-4">Customer</th>
                  <th className="pb-4 pr-4">Amount</th>
                  <th className="pb-4 pr-4">Status</th>
                  <th className="pb-4">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-50">
                {data.recentOrders.map((order) => (
                  <tr key={order.id} className="group hover:bg-neutral-50/50 transition-colors">
                    <td className="py-4 pr-4 text-sm font-bold text-neutral-900">#{order.id.slice(-6).toUpperCase()}</td>
                    <td className="py-4 pr-4 text-sm font-medium text-neutral-600">{order.customerName}</td>
                    <td className="py-4 pr-4 text-sm font-black text-neutral-900">৳{order.total.toLocaleString()}</td>
                    <td className="py-4 pr-4">
                      <StatusBadge status={order.status} />
                    </td>
                    <td className="py-4 text-xs font-bold text-neutral-400">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Breakdown */}
        <section className="rounded-[2.5rem] border border-neutral-200 bg-white p-8 shadow-sm">
          <h3 className="text-xl font-bold text-neutral-950">Status Breakdown</h3>
          <div className="mt-8 space-y-6">
            <StatusProgress label="Pending" count={data.statusCounts.pending || 0} total={data.stats.totalOrders} color="bg-amber-500" />
            <StatusProgress label="Confirmed" count={data.statusCounts.confirmed || 0} total={data.stats.totalOrders} color="bg-blue-500" />
            <StatusProgress label="Shipped" count={data.statusCounts.shipped || 0} total={data.stats.totalOrders} color="bg-purple-500" />
            <StatusProgress label="Delivered" count={data.statusCounts.delivered || 0} total={data.stats.totalOrders} color="bg-emerald-500" />
            <StatusProgress label="Cancelled" count={data.statusCounts.cancelled || 0} total={data.stats.totalOrders} color="bg-red-500" />
          </div>
        </section>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon: Icon, trend, trendUp, color }: any) {
  return (
    <motion.div 
      whileHover={{ y: -4 }}
      className="group relative overflow-hidden rounded-[2rem] border border-neutral-200 bg-white p-6 shadow-sm transition-all hover:shadow-xl hover:shadow-neutral-950/5"
    >
      <div className="flex items-start justify-between">
        <div className={cn("grid size-12 place-items-center rounded-2xl text-white shadow-lg shadow-current/20", color)}>
          <Icon className="size-6" />
        </div>
        <div className={cn(
          "flex items-center gap-1 rounded-full px-2 py-1 text-[10px] font-black uppercase tracking-widest",
          trendUp ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600"
        )}>
          {trendUp ? <ArrowUpRight className="size-3" /> : <ArrowDownRight className="size-3" />}
          {trend}
        </div>
      </div>
      <div className="mt-6">
        <p className="text-xs font-bold uppercase tracking-widest text-neutral-400">{title}</p>
        <h4 className="mt-1 text-2xl font-black text-neutral-950">{value}</h4>
      </div>
    </motion.div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const configs: any = {
    pending: { color: "bg-amber-50 text-amber-700", icon: Clock },
    confirmed: { color: "bg-blue-50 text-blue-700", icon: CheckCircle2 },
    processing: { color: "bg-indigo-50 text-indigo-700", icon: Package },
    shipped: { color: "bg-purple-50 text-purple-700", icon: Truck },
    delivered: { color: "bg-emerald-50 text-emerald-700", icon: CheckCircle2 },
    cancelled: { color: "bg-red-50 text-red-700", icon: AlertCircle },
  };
  const config = configs[status] || configs.pending;
  return (
    <div className={cn("inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider", config.color)}>
      <config.icon className="size-3" />
      {status}
    </div>
  );
}

function StatusProgress({ label, count, total, color }: any) {
  const percent = total > 0 ? (count / total) * 100 : 0;
  return (
    <div className="space-y-2">
      <div className="flex justify-between text-xs font-bold uppercase tracking-widest">
        <span className="text-neutral-500">{label}</span>
        <span className="text-neutral-950">{count}</span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-neutral-100">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${percent}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
          className={cn("h-full", color)} 
        />
      </div>
    </div>
  );
}
