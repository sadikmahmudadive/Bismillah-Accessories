"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Image as ImageIcon, 
  Plus, 
  Trash2, 
  Save, 
  Eye, 
  EyeOff, 
  MoveUp, 
  MoveDown,
  Loader2,
  ExternalLink,
  RefreshCw,
  Layout
} from "lucide-react";
import { useAuth } from "@/components/auth/auth-provider";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import type { OfferBanner } from "@/types/domain";

export function BannerManager() {
  const { user } = useAuth();
  const [banners, setBanners] = useState<OfferBanner[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  // New/Edit State
  const [editingBanner, setEditingBanner] = useState<Partial<OfferBanner> | null>(null);

  useEffect(() => {
    void loadBanners();
  }, [user]);

  async function loadBanners() {
    if (!user) return;
    setIsLoading(true);
    try {
      const token = await user.getIdToken();
      const res = await fetch("/api/admin/banners", {
        headers: { Authorization: `Bearer ${token}` }
      });
      const payload = await res.json();
      if (res.ok) setBanners(payload.data || []);
    } catch (err) {
      console.error("Load banners error", err);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleSave() {
    if (!user || !editingBanner?.title || !editingBanner?.imageUrl) return;
    setIsSaving(true);
    try {
      const token = await user.getIdToken();
      const isUpdate = !!editingBanner.id;
      const url = isUpdate ? `/api/admin/banners/${editingBanner.id}` : "/api/admin/banners";
      const method = isUpdate ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify(editingBanner)
      });

      if (res.ok) {
        await loadBanners();
        setEditingBanner(null);
      }
    } catch (err) {
      console.error("Save banner error", err);
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!user || !window.confirm("Are you sure you want to remove this banner?")) return;
    try {
      const token = await user.getIdToken();
      const res = await fetch(`/api/admin/banners/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setBanners(prev => prev.filter(b => b.id !== id));
      }
    } catch (err) {
      console.error("Delete error", err);
    }
  }

  async function toggleStatus(banner: OfferBanner) {
    if (!user) return;
    try {
      const token = await user.getIdToken();
      const res = await fetch(`/api/admin/banners/${banner.id}`, {
        method: "PATCH",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ isActive: !banner.isActive })
      });
      if (res.ok) {
        setBanners(prev => prev.map(b => b.id === banner.id ? { ...b, isActive: !b.isActive } : b));
      }
    } catch (err) {
      console.error("Toggle error", err);
    }
  }

  return (
    <div className="grid gap-6">
      <div className="rounded-[2.5rem] border border-neutral-200 bg-white p-8 shadow-sm">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-[#f6f4ee] px-3 py-1 text-sm font-semibold text-neutral-700">
              <Layout className="size-4 text-[#2f9e74]" />
              Storefront Graphics
            </div>
            <h2 className="mt-4 text-2xl font-semibold text-neutral-950">Promotional Banners</h2>
            <p className="mt-1 text-sm text-neutral-500">Manage the hero slides and offer banners on the homepage.</p>
          </div>

          <button 
            onClick={() => setEditingBanner({ 
              title: "", 
              subtitle: "",
              imageUrl: "", 
              link: "",
              buttonText: "Shop Now",
              isActive: true, 
              order: banners.length 
            })}
            className="flex h-12 items-center gap-2 rounded-full bg-neutral-950 px-6 text-sm font-bold text-white transition hover:scale-105"
          >
            <Plus className="size-4" />
            Add New Banner
          </button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_350px] lg:items-start">
        {/* Banner List */}
        <div className="grid gap-4">
          {isLoading ? (
            [1, 2].map(i => <div key={i} className="h-40 w-full animate-pulse rounded-[2rem] bg-neutral-100" />)
          ) : banners.length === 0 ? (
            <div className="rounded-[2.5rem] border border-dashed border-neutral-300 py-20 text-center">
              <ImageIcon className="mx-auto size-12 text-neutral-200" />
              <h3 className="mt-4 text-lg font-bold text-neutral-900">No banners active</h3>
              <p className="mt-1 text-sm text-neutral-500">Create your first promotion to wow your customers.</p>
            </div>
          ) : (
            banners.map((banner) => (
              <motion.div
                key={banner.id}
                layout
                className={cn(
                  "group relative overflow-hidden rounded-[2rem] border bg-white shadow-sm transition-all hover:border-neutral-300",
                  !banner.isActive && "opacity-60"
                )}
              >
                <div className="flex flex-col sm:flex-row">
                  <div className="relative h-40 w-full shrink-0 bg-neutral-100 sm:w-64">
                    <img 
                      src={banner.imageUrl} 
                      alt={banner.title}
                      className="h-full w-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                  </div>
                  
                  <div className="flex flex-1 flex-col p-6">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h4 className="text-lg font-bold text-neutral-950">{banner.title}</h4>
                        <p className="text-sm text-neutral-500">{banner.subtitle}</p>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => toggleStatus(banner)}
                          className={cn(
                            "grid size-9 place-items-center rounded-xl transition-colors",
                            banner.isActive ? "bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white" : "bg-neutral-100 text-neutral-400 hover:bg-neutral-950 hover:text-white"
                          )}
                        >
                          {banner.isActive ? <Eye className="size-4" /> : <EyeOff className="size-4" />}
                        </button>
                        <button 
                          onClick={() => setEditingBanner(banner)}
                          className="grid size-9 place-items-center rounded-xl bg-neutral-50 text-neutral-600 transition-colors hover:bg-neutral-950 hover:text-white"
                        >
                          <RefreshCw className="size-4" />
                        </button>
                        <button 
                          onClick={() => handleDelete(banner.id)}
                          className="grid size-9 place-items-center rounded-xl bg-red-50 text-red-600 transition-colors hover:bg-red-600 hover:text-white"
                        >
                          <Trash2 className="size-4" />
                        </button>
                      </div>
                    </div>
                    
                    <div className="mt-auto flex items-center gap-4 pt-4 text-xs font-bold uppercase tracking-widest text-neutral-400">
                      <div className="flex items-center gap-1.5">
                        <ExternalLink className="size-3" />
                        {banner.link || "No Link"}
                      </div>
                      <div className="ml-auto">
                        Order: {banner.order}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>

        {/* Editor Sidebar */}
        <AnimatePresence>
          {editingBanner && (
            <motion.aside
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="sticky top-24 rounded-[2.5rem] border border-neutral-200 bg-white p-8 shadow-2xl ring-1 ring-neutral-950/5"
            >
              <div className="flex items-center gap-3 border-b border-neutral-100 pb-6">
                <div className="grid size-10 place-items-center rounded-xl bg-neutral-900 text-white">
                  <Plus className="size-5" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-neutral-950">
                    {editingBanner.id ? "Edit Banner" : "New Promotion"}
                  </h3>
                  <p className="text-xs font-medium text-neutral-400">Configure your hero slide</p>
                </div>
              </div>
              
              <div className="mt-8 space-y-6">
                {/* Preview Card */}
                {editingBanner.imageUrl && (
                  <div className="group relative aspect-[2/1] overflow-hidden rounded-2xl border border-neutral-200 bg-neutral-50 shadow-inner">
                    <img 
                      src={editingBanner.imageUrl} 
                      alt="Preview" 
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute bottom-3 left-3 right-3 text-white">
                      <p className="text-[10px] font-black uppercase tracking-widest opacity-70">Preview</p>
                      <p className="line-clamp-1 text-sm font-bold">{editingBanner.title || "Your Title Here"}</p>
                    </div>
                  </div>
                )}

                <div className="grid gap-5">
                  <div className="grid gap-2">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-500">Main Title</label>
                    <div className="relative">
                      <Layout className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-neutral-400" />
                      <input 
                        value={editingBanner.title || ""}
                        onChange={e => setEditingBanner({ ...editingBanner, title: e.target.value })}
                        className="h-12 w-full rounded-2xl border border-neutral-200 bg-neutral-50 pl-11 pr-4 text-sm font-bold outline-none transition focus:border-neutral-950 focus:bg-white"
                        placeholder="E.g. Summer Mega Sale"
                      />
                    </div>
                  </div>
                  
                  <div className="grid gap-2">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-500">Subtitle</label>
                    <input 
                      value={editingBanner.subtitle || ""}
                      onChange={e => setEditingBanner({ ...editingBanner, subtitle: e.target.value })}
                      className="h-12 w-full rounded-2xl border border-neutral-200 bg-neutral-50 px-4 text-sm font-bold outline-none transition focus:border-neutral-950 focus:bg-white"
                      placeholder="E.g. Up to 50% off on all items"
                    />
                  </div>

                  <div className="grid gap-2">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-500">Image URL</label>
                    <div className="relative">
                      <ImageIcon className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-neutral-400" />
                      <input 
                        value={editingBanner.imageUrl || ""}
                        onChange={e => setEditingBanner({ ...editingBanner, imageUrl: e.target.value })}
                        className="h-12 w-full rounded-2xl border border-neutral-200 bg-neutral-50 pl-11 pr-4 text-sm font-bold outline-none transition focus:border-neutral-950 focus:bg-white"
                        placeholder="https://images.unsplash.com/..."
                      />
                    </div>
                  </div>

                  <div className="grid gap-2">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-500">Target Link</label>
                    <div className="relative">
                      <ExternalLink className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-neutral-400" />
                      <input 
                        value={editingBanner.link || ""}
                        onChange={e => setEditingBanner({ ...editingBanner, link: e.target.value })}
                        className="h-12 w-full rounded-2xl border border-neutral-200 bg-neutral-50 pl-11 pr-4 text-sm font-bold outline-none transition focus:border-neutral-950 focus:bg-white"
                        placeholder="/products?category=Cases"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <label className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-500">Sort Order</label>
                      <input 
                        type="number"
                        value={editingBanner.order ?? 0}
                        onChange={e => setEditingBanner({ ...editingBanner, order: parseInt(e.target.value) })}
                        className="h-12 w-full rounded-2xl border border-neutral-200 bg-neutral-50 px-4 text-sm font-bold outline-none transition focus:border-neutral-950 focus:bg-white"
                      />
                    </div>
                    <div className="grid gap-2">
                      <label className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-500">Button Text</label>
                      <input 
                        value={editingBanner.buttonText || ""}
                        onChange={e => setEditingBanner({ ...editingBanner, buttonText: e.target.value })}
                        className="h-12 w-full rounded-2xl border border-neutral-200 bg-neutral-50 px-4 text-sm font-bold outline-none transition focus:border-neutral-950 focus:bg-white"
                        placeholder="Shop Now"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 pt-6">
                  <button 
                    className="flex h-12 flex-1 items-center justify-center gap-2 rounded-2xl bg-neutral-950 px-6 text-sm font-bold text-white transition hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50" 
                    onClick={handleSave}
                    disabled={isSaving || !editingBanner.title || !editingBanner.imageUrl}
                  >
                    {isSaving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
                    {editingBanner.id ? "Update Banner" : "Publish Now"}
                  </button>
                  <button 
                    onClick={() => setEditingBanner(null)}
                    className="flex h-12 items-center justify-center rounded-2xl border border-neutral-200 px-6 text-sm font-bold text-neutral-600 transition hover:bg-neutral-50"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </motion.aside>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
