"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Ticket, Trash2, RefreshCw, X, Calendar, Percent, Banknote, Power, Search } from "lucide-react";
import { useAuth } from "@/components/auth/auth-provider";
import { Button } from "@/components/ui/button";
import type { PromoCode, PromoCodeType } from "@/types/domain";
import { cn } from "@/lib/utils";

// Re-using motion components
const Motion = {
  div: motion.div,
  article: motion.article
};

export function PromoManager() {
  const { user } = useAuth();
  const [promos, setPromos] = useState<PromoCode[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Form state
  const [form, setForm] = useState({
    code: "",
    type: "percentage" as PromoCodeType,
    value: "",
    minOrderAmount: "",
    maxDiscountAmount: "",
    expiryDate: "",
    usageLimit: ""
  });

  useEffect(() => {
    if (user) void loadPromos();
  }, [user]);

  async function loadPromos() {
    if (!user) return;
    setIsLoading(true);
    setError(null);
    try {
      const token = await user.getIdToken();
      const res = await fetch("/api/admin/promo", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const payload = await res.json();
      if (!res.ok) throw new Error(payload.error || "Failed to load promos");
      setPromos(payload.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error loading promo codes");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    setIsLoading(true);
    try {
      const token = await user.getIdToken();
      const res = await fetch("/api/admin/promo", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });
      const payload = await res.json();
      if (!res.ok) throw new Error(payload.error || "Failed to create promo");
      
      setForm({ code: "", type: "percentage", value: "", minOrderAmount: "", maxDiscountAmount: "", expiryDate: "", usageLimit: "" });
      setIsAdding(false);
      await loadPromos();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error creating promo code");
    } finally {
      setIsLoading(false);
    }
  }

  const filteredPromos = promos.filter(p => 
    p.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="grid gap-6">
      <div className="rounded-[2.5rem] border border-neutral-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-[#f6f4ee] px-3 py-1 text-xs font-bold uppercase tracking-wider text-neutral-700">
              <Ticket className="size-3.5 text-[#2f9e74]" />
              Discount System
            </div>
            <h2 className="mt-4 text-2xl font-semibold text-neutral-950">Promo Codes</h2>
            <p className="mt-2 text-sm text-neutral-600">Create and manage coupon codes for your storefront.</p>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-neutral-400" />
              <input 
                type="text"
                placeholder="Find code..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-10 w-full rounded-full border border-neutral-200 bg-[#fafaf8] pl-10 pr-4 text-sm font-medium outline-none focus:border-neutral-950"
              />
            </div>
            <Button onClick={() => setIsAdding(true)}>
              <Plus className="size-4" />
              Add Code
            </Button>
          </div>
        </div>

        {error && (
          <div className="mt-6 rounded-2xl bg-[#d65f5f]/10 p-4 text-sm font-semibold text-[#8f3434]">
            {error}
          </div>
        )}

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {isLoading && promos.length === 0 ? (
            [1, 2, 3].map(i => <div key={i} className="h-40 w-full animate-pulse rounded-[2rem] bg-neutral-100" />)
          ) : filteredPromos.length === 0 ? (
            <div className="col-span-full rounded-[2rem] border border-dashed border-neutral-300 py-16 text-center">
              <p className="text-sm font-semibold text-neutral-500">No promo codes found.</p>
            </div>
          ) : (
            filteredPromos.map(promo => (
              <PromoCard key={promo.id} promo={promo} />
            ))
          )}
        </div>
      </div>

      {/* Add Modal */}
      <AnimatePresence>
        {isAdding && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAdding(false)}
              className="absolute inset-0 bg-neutral-950/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-lg rounded-[2.5rem] bg-white p-8 shadow-2xl"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-neutral-950">New Promo Code</h3>
                <button onClick={() => setIsAdding(false)} className="rounded-full p-2 hover:bg-neutral-100">
                  <X className="size-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="grid gap-5">
                <div className="grid gap-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-neutral-400">Code Name</label>
                  <input 
                    required
                    value={form.code}
                    onChange={e => setForm({...form, code: e.target.value.toUpperCase()})}
                    placeholder="e.g. SUMMER24"
                    className="h-11 rounded-xl border border-neutral-200 bg-neutral-50 px-4 text-sm font-bold outline-none focus:border-neutral-950"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-neutral-400">Type</label>
                    <select 
                      value={form.type}
                      onChange={e => setForm({...form, type: e.target.value as any})}
                      className="h-11 rounded-xl border border-neutral-200 bg-neutral-50 px-4 text-sm font-bold outline-none focus:border-neutral-950"
                    >
                      <option value="percentage">Percentage (%)</option>
                      <option value="fixed">Fixed (৳)</option>
                    </select>
                  </div>
                  <div className="grid gap-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-neutral-400">Value</label>
                    <input 
                      required
                      type="number"
                      value={form.value}
                      onChange={e => setForm({...form, value: e.target.value})}
                      placeholder="e.g. 10"
                      className="h-11 rounded-xl border border-neutral-200 bg-neutral-50 px-4 text-sm font-bold outline-none focus:border-neutral-950"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-neutral-400">Min Order</label>
                    <input 
                      type="number"
                      value={form.minOrderAmount}
                      onChange={e => setForm({...form, minOrderAmount: e.target.value})}
                      placeholder="Optional"
                      className="h-11 rounded-xl border border-neutral-200 bg-neutral-50 px-4 text-sm font-bold outline-none focus:border-neutral-950"
                    />
                  </div>
                  <div className="grid gap-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-neutral-400">Usage Limit</label>
                    <input 
                      type="number"
                      value={form.usageLimit}
                      onChange={e => setForm({...form, usageLimit: e.target.value})}
                      placeholder="Unlimited if empty"
                      className="h-11 rounded-xl border border-neutral-200 bg-neutral-50 px-4 text-sm font-bold outline-none focus:border-neutral-950"
                    />
                  </div>
                </div>

                <div className="grid gap-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-neutral-400">Expiry Date</label>
                  <input 
                    type="date"
                    value={form.expiryDate}
                    onChange={e => setForm({...form, expiryDate: e.target.value})}
                    className="h-11 rounded-xl border border-neutral-200 bg-neutral-50 px-4 text-sm font-bold outline-none focus:border-neutral-950"
                  />
                </div>

                <Button type="submit" disabled={isLoading} className="mt-2 h-12">
                  {isLoading ? "Saving..." : "Create Promo Code"}
                </Button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function PromoCard({ promo }: { promo: PromoCode }) {
  const isExpired = promo.expiryDate && new Date(promo.expiryDate as any) < new Date();
  const isUsageLimitReached = promo.usageLimit && promo.usageCount >= promo.usageLimit;

  return (
    <motion.article 
      layout
      className="group relative overflow-hidden rounded-[2rem] border border-neutral-200 bg-white p-5 transition-all hover:border-neutral-300 hover:shadow-xl hover:shadow-neutral-950/5"
    >
      <div className="flex items-start justify-between">
        <div className="flex size-10 items-center justify-center rounded-2xl bg-neutral-100 text-neutral-950 group-hover:bg-neutral-950 group-hover:text-white transition-colors">
          {promo.type === "percentage" ? <Percent className="size-5" /> : <Banknote className="size-5" />}
        </div>
        <div className={cn(
          "rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider",
          promo.isActive && !isExpired && !isUsageLimitReached ? "bg-[#2f9e74]/10 text-[#2f9e74]" : "bg-neutral-100 text-neutral-400"
        )}>
          {isExpired ? "Expired" : isUsageLimitReached ? "Limit Reached" : promo.isActive ? "Active" : "Inactive"}
        </div>
      </div>

      <div className="mt-5">
        <h4 className="font-mono text-xl font-black tracking-tighter text-neutral-950">{promo.code}</h4>
        <p className="mt-1 text-sm font-bold text-neutral-500">
          {promo.type === "percentage" ? `${promo.value}% Off` : `৳${promo.value.toLocaleString()} Off`}
        </p>
      </div>

      <div className="mt-6 space-y-2 border-t border-neutral-100 pt-4">
        <div className="flex items-center justify-between text-[11px] font-bold text-neutral-400">
          <span className="flex items-center gap-1.5 uppercase tracking-wide">
            <RefreshCw className="size-3" /> Usage
          </span>
          <span className="text-neutral-950">{promo.usageCount} {promo.usageLimit ? `/ ${promo.usageLimit}` : ""}</span>
        </div>
        {promo.expiryDate && (
          <div className="flex items-center justify-between text-[11px] font-bold text-neutral-400">
            <span className="flex items-center gap-1.5 uppercase tracking-wide">
              <Calendar className="size-3" /> Expires
            </span>
            <span className={cn("text-neutral-950", isExpired && "text-[#d65f5f]")}>
              {new Date(promo.expiryDate as any).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </span>
          </div>
        )}
      </div>
    </motion.article>
  );
}
