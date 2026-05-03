"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  History, 
  RefreshCw, 
  Search, 
  ArrowUpRight, 
  ArrowDownRight, 
  Package, 
  User, 
  ShoppingCart, 
  Settings,
  Filter,
  X
} from "lucide-react";
import { useAuth } from "@/components/auth/auth-provider";
import { cn } from "@/lib/utils";

type StockLog = {
  id: string;
  productId: string;
  productName: string;
  type: "sale" | "restock" | "manual_adjustment" | "cancellation_refund";
  changeAmount: number;
  previousStock: number;
  newStock: number;
  orderId?: string;
  adminId?: string;
  createdAt: string;
};

export function StockHistory() {
  const { user } = useAuth();
  const [logs, setLogs] = useState<StockLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");

  useEffect(() => {
    void loadLogs();
  }, [user]);

  async function loadLogs() {
    if (!user) return;
    setIsLoading(true);
    try {
      const token = await user.getIdToken();
      const res = await fetch("/api/admin/stock-logs", {
        headers: { Authorization: `Bearer ${token}` }
      });
      const payload = await res.json();
      if (res.ok) setLogs(payload.data || []);
    } catch (err) {
      console.error("Failed to load logs", err);
    } finally {
      setIsLoading(false);
    }
  }

  const filteredLogs = logs.filter(log => {
    const matchesSearch = log.productName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          log.orderId?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === "all" || log.type === typeFilter;
    return matchesSearch && matchesType;
  });

  return (
    <div className="grid gap-6">
      <div className="rounded-[2.5rem] border border-neutral-200 bg-white p-8 shadow-sm">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-[#f6f4ee] px-3 py-1 text-sm font-semibold text-neutral-700">
              <History className="size-4 text-[#2f9e74]" />
              Inventory Ledger
            </div>
            <h2 className="mt-4 text-2xl font-semibold text-neutral-950">Stock History Reports</h2>
            <p className="mt-1 text-sm text-neutral-500">Track every movement in your inventory across sales and manual updates.</p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[240px]">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-neutral-400" />
              <input 
                type="text"
                placeholder="Search product or order ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-10 w-full rounded-full border border-neutral-200 bg-[#fafaf8] pl-10 pr-4 text-sm font-medium outline-none focus:border-neutral-950"
              />
            </div>
            <button 
              onClick={loadLogs} 
              disabled={isLoading}
              className="flex h-10 items-center gap-2 rounded-full bg-neutral-100 px-5 text-sm font-bold text-neutral-700 transition hover:bg-neutral-200"
            >
              <RefreshCw className={cn("size-4", isLoading && "animate-spin")} />
              Refresh
            </button>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-2">
          {["all", "sale", "manual_adjustment", "restock", "cancellation_refund"].map(type => (
            <button
              key={type}
              onClick={() => setTypeFilter(type)}
              className={cn(
                "rounded-full px-4 py-1.5 text-xs font-bold capitalize transition-all",
                typeFilter === type 
                  ? "bg-neutral-950 text-white shadow-lg shadow-neutral-950/20" 
                  : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
              )}
            >
              {type.replace("_", " ")}
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-[2.5rem] border border-neutral-200 bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-neutral-100 bg-neutral-50/50 text-[11px] font-bold uppercase tracking-widest text-neutral-400">
                <th className="px-8 py-5">Product</th>
                <th className="px-4 py-5">Activity</th>
                <th className="px-4 py-5 text-center">Change</th>
                <th className="px-4 py-5 text-center">Inventory</th>
                <th className="px-4 py-5">Reference</th>
                <th className="px-8 py-5 text-right">Date & Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-50">
              <AnimatePresence mode="popLayout">
                {filteredLogs.map((log) => (
                  <motion.tr 
                    key={log.id}
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="group hover:bg-neutral-50/50 transition-colors"
                  >
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-3">
                        <div className="grid size-9 place-items-center rounded-xl bg-neutral-100 text-neutral-400 group-hover:bg-neutral-950 group-hover:text-white transition-colors">
                          <Package className="size-4" />
                        </div>
                        <span className="text-sm font-bold text-neutral-900">{log.productName}</span>
                      </div>
                    </td>
                    <td className="px-4 py-5">
                      <LogTypeBadge type={log.type} />
                    </td>
                    <td className="px-4 py-5 text-center">
                      <div className={cn(
                        "inline-flex items-center gap-1 text-sm font-black",
                        log.changeAmount > 0 ? "text-emerald-600" : "text-red-600"
                      )}>
                        {log.changeAmount > 0 ? "+" : ""}{log.changeAmount}
                        {log.changeAmount > 0 ? <ArrowUpRight className="size-3.5" /> : <ArrowDownRight className="size-3.5" />}
                      </div>
                    </td>
                    <td className="px-4 py-5 text-center">
                      <div className="text-xs font-bold text-neutral-400">
                        <span className="line-through opacity-50">{log.previousStock}</span>
                        <span className="mx-1.5 text-neutral-900">→</span>
                        <span className="text-neutral-950">{log.newStock}</span>
                      </div>
                    </td>
                    <td className="px-4 py-5">
                      {log.orderId ? (
                        <div className="flex items-center gap-2 text-xs font-mono font-bold text-blue-600">
                          <ShoppingCart className="size-3" /> #{log.orderId.slice(-6).toUpperCase()}
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-xs font-bold text-neutral-400">
                          <User className="size-3" /> System Admin
                        </div>
                      )}
                    </td>
                    <td className="px-8 py-5 text-right">
                      <div className="text-xs font-bold text-neutral-900">
                        {new Date(log.createdAt).toLocaleDateString()}
                      </div>
                      <div className="mt-0.5 text-[10px] font-bold text-neutral-400 uppercase tracking-tighter">
                        {new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
        
        {!isLoading && filteredLogs.length === 0 && (
          <div className="py-20 text-center">
            <History className="mx-auto size-12 text-neutral-200" />
            <h3 className="mt-4 text-lg font-bold text-neutral-900">No activity found</h3>
            <p className="mt-1 text-sm text-neutral-500">No stock movements match your current filters.</p>
          </div>
        )}
      </div>
    </div>
  );
}

function LogTypeBadge({ type }: { type: StockLog["type"] }) {
  const configs = {
    sale: { label: "Customer Sale", icon: ShoppingCart, color: "text-emerald-700 bg-emerald-50" },
    manual_adjustment: { label: "Manual Update", icon: Settings, color: "text-amber-700 bg-amber-50" },
    restock: { label: "Restock", icon: Package, color: "text-blue-700 bg-blue-50" },
    cancellation_refund: { label: "Refund Restock", icon: X, color: "text-purple-700 bg-purple-50" },
  };
  const config = configs[type] || configs.manual_adjustment;
  return (
    <div className={cn("inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-wider", config.color)}>
      <config.icon className="size-3" />
      {config.label}
    </div>
  );
}
