"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  MessageSquare, 
  Trash2, 
  RefreshCw, 
  Search, 
  User, 
  Package, 
  ExternalLink,
  Loader2
} from "lucide-react";
import { useAuth } from "@/components/auth/auth-provider";
import { cn } from "@/lib/utils";
import { StarRating } from "@/components/product/product-reviews";
import Link from "next/link";

type Review = {
  id: string;
  productId: string;
  productName?: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  createdAt: string;
};

export function ReviewManager() {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    void loadReviews();
  }, [user]);

  async function loadReviews() {
    if (!user) return;
    setIsLoading(true);
    try {
      const token = await user.getIdToken();
      const res = await fetch("/api/admin/reviews", {
        headers: { Authorization: `Bearer ${token}` }
      });
      const payload = await res.json();
      if (res.ok) setReviews(payload.data || []);
    } catch (err) {
      console.error("Failed to load reviews", err);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleDeleteReview(id: string) {
    if (!window.confirm("Are you sure you want to delete this review?")) return;
    setDeletingId(id);
    try {
      const token = await user?.getIdToken();
      const res = await fetch(`/api/admin/reviews/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setReviews(prev => prev.filter(r => r.id !== id));
      }
    } catch (err) {
      console.error("Delete failed", err);
    } finally {
      setDeletingId(null);
    }
  }

  const filteredReviews = reviews.filter(r => 
    r.comment.toLowerCase().includes(searchQuery.toLowerCase()) || 
    r.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.productName?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="grid gap-6">
      <div className="rounded-[2.5rem] border border-neutral-200 bg-white p-8 shadow-sm">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-[#f6f4ee] px-3 py-1 text-sm font-semibold text-neutral-700">
              <MessageSquare className="size-4 text-[#2f9e74]" />
              Moderation Desk
            </div>
            <h2 className="mt-4 text-2xl font-semibold text-neutral-950">Manage Product Reviews</h2>
            <p className="mt-1 text-sm text-neutral-500">Monitor customer feedback and maintain the quality of product discussions.</p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[240px]">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-neutral-400" />
              <input 
                type="text"
                placeholder="Search reviews, users, or products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-10 w-full rounded-full border border-neutral-200 bg-[#fafaf8] pl-10 pr-4 text-sm font-medium outline-none focus:border-neutral-950"
              />
            </div>
            <button 
              onClick={loadReviews} 
              disabled={isLoading}
              className="flex h-10 items-center gap-2 rounded-full bg-neutral-100 px-5 text-sm font-bold text-neutral-700 transition hover:bg-neutral-200"
            >
              <RefreshCw className={cn("size-4", isLoading && "animate-spin")} />
              Refresh
            </button>
          </div>
        </div>
      </div>

      <div className="grid gap-4">
        {isLoading ? (
          [1, 2, 3].map(i => <div key={i} className="h-32 w-full animate-pulse rounded-[2rem] bg-neutral-100" />)
        ) : filteredReviews.length === 0 ? (
          <div className="rounded-[2.5rem] border border-dashed border-neutral-300 py-20 text-center">
            <MessageSquare className="mx-auto size-12 text-neutral-200" />
            <h3 className="mt-4 text-lg font-bold text-neutral-900">No reviews found</h3>
            <p className="mt-1 text-sm text-neutral-500">No customer feedback matches your search criteria.</p>
          </div>
        ) : (
          <div className="grid gap-4">
            <AnimatePresence mode="popLayout">
              {filteredReviews.map((review) => (
                <motion.article
                  key={review.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="rounded-[2rem] border border-neutral-200 bg-white p-6 shadow-sm transition hover:border-neutral-300"
                >
                  <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
                    <div className="grid size-12 shrink-0 place-items-center rounded-2xl bg-[#f6f4ee] text-neutral-950">
                      <User className="size-6" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center justify-between gap-4">
                        <div>
                          <h4 className="text-sm font-bold text-neutral-900">{review.userName}</h4>
                          <div className="mt-1 flex items-center gap-2 text-xs font-medium text-neutral-400">
                            <Package className="size-3" />
                            <span>{review.productName || "Deleted Product"}</span>
                            <span>•</span>
                            <span>{new Date(review.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-3">
                          <StarRating rating={review.rating} readonly size="sm" />
                          <div className="h-4 w-px bg-neutral-100" />
                          <button
                            onClick={() => handleDeleteReview(review.id)}
                            disabled={deletingId === review.id}
                            className="grid size-9 place-items-center rounded-xl bg-red-50 text-red-600 transition hover:bg-red-600 hover:text-white disabled:opacity-50"
                          >
                            {deletingId === review.id ? <Loader2 className="size-4 animate-spin" /> : <Trash2 className="size-4" />}
                          </button>
                        </div>
                      </div>
                      
                      <div className="mt-4 relative">
                        <p className="text-sm leading-relaxed text-neutral-700 italic">
                          "{review.comment}"
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.article>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
