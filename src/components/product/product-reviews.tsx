"use client";

import { useEffect, useState } from "react";
import { 
  Star, 
  Loader2, 
  User, 
  CheckCircle2, 
  MessageSquare, 
  ShoppingCart 
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

import { useAuth } from "@/components/auth/auth-provider";
import { Button } from "@/components/ui/button";
import type { Review } from "@/types/domain";
import { cn } from "@/lib/utils";

// StarRating Component
export function StarRating({ 
  rating, 
  setRating, 
  readonly = false,
  size = "md"
}: { 
  rating: number; 
  setRating?: (r: number) => void;
  readonly?: boolean;
  size?: "sm" | "md" | "lg";
}) {
  const sizeClasses = {
    sm: "size-3.5",
    md: "size-5",
    lg: "size-6"
  };

  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={readonly}
          onClick={() => setRating?.(star)}
          className={cn(
            "transition-colors",
            readonly ? "cursor-default" : "cursor-pointer hover:scale-110",
            star <= rating ? "text-[#b8860b]" : "text-neutral-300"
          )}
        >
          <Star className={cn(sizeClasses[size], star <= rating && "fill-current")} />
        </button>
      ))}
    </div>
  );
}

export function ProductReviews({ productId }: { productId: string }) {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [summary, setSummary] = useState<{ total: number; distribution: Record<number, number> } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [canReview, setCanReview] = useState(false);
  
  // Form state
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const hasReviewed = reviews.some(r => r.userId === user?.uid);

  useEffect(() => {
    fetchReviews();
    if (user) void checkPurchaseStatus();
  }, [productId, user]);

  async function checkPurchaseStatus() {
    try {
      const token = await user?.getIdToken();
      const res = await fetch("/api/orders/user", {
        headers: { Authorization: `Bearer ${token}` }
      });
      const payload = await res.json();
      if (res.ok) {
        const orders = payload.data || [];
        const purchased = orders.some((o: any) => 
          o.status === "delivered" && 
          o.items.some((i: any) => i.id === productId)
        );
        setCanReview(purchased);
      }
    } catch (err) {
      console.error("Failed to check purchase status", err);
    }
  }

  async function fetchReviews() {
    try {
      const res = await fetch(`/api/products/${productId}/reviews`);
      const payload = await res.json();
      if (payload.success) {
        setReviews(payload.data);
        setSummary(payload.summary);
      }
    } catch (err) {
      console.error("Failed to load reviews", err);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user || !canReview) return;
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      const token = await user.getIdToken();
      const res = await fetch(`/api/products/${productId}/reviews`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ rating, comment, userName: user.displayName })
      });
      
      const payload = await res.json();
      
      if (!res.ok || !payload.success) {
        throw new Error(payload.error || "Failed to submit review");
      }
      
      await fetchReviews();
      setComment("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="mt-20 overflow-hidden rounded-[2.5rem] border border-neutral-200 bg-white shadow-sm">
      <div className="grid lg:grid-cols-[400px_1fr]">
        {/* Sidebar: Summary & Form */}
        <div className="border-b border-neutral-200 bg-neutral-50/50 p-8 lg:border-b-0 lg:border-r">
          <h2 className="text-2xl font-semibold text-neutral-950">Reviews</h2>
          
          {summary && summary.total > 0 && (
            <div className="mt-8 space-y-4">
              <div className="flex items-baseline gap-2">
                <span className="text-5xl font-black text-neutral-950">
                  {(Object.entries(summary.distribution).reduce((acc, [r, count]) => acc + (Number(r) * count), 0) / summary.total).toFixed(1)}
                </span>
                <span className="text-sm font-bold text-neutral-400">out of 5</span>
              </div>
              <div className="space-y-2">
                {[5, 4, 3, 2, 1].map((star) => (
                  <div key={star} className="flex items-center gap-3">
                    <span className="w-3 text-xs font-bold text-neutral-400">{star}</span>
                    <div className="h-2 flex-1 rounded-full bg-neutral-200 overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${(summary.distribution[star] / summary.total) * 100}%` }}
                        className="h-full bg-[#b8860b]"
                      />
                    </div>
                    <span className="w-8 text-right text-xs font-bold text-neutral-400">
                      {Math.round((summary.distribution[star] / summary.total) * 100)}%
                    </span>
                  </div>
                ))}
              </div>
              <p className="text-xs font-medium text-neutral-500">{summary.total} verified ratings</p>
            </div>
          )}

          <div className="mt-12 h-px bg-neutral-200" />

          {/* Review Form */}
          <div className="mt-10">
            {user ? (
              hasReviewed ? (
                <div className="rounded-2xl bg-emerald-50 p-4 text-center">
                  <CheckCircle2 className="mx-auto size-6 text-emerald-600" />
                  <p className="mt-2 text-sm font-bold text-emerald-700">You've reviewed this product</p>
                </div>
              ) : canReview ? (
                <div>
                  <h3 className="text-sm font-bold text-neutral-900">Share your thoughts</h3>
                  <form onSubmit={handleSubmit} className="mt-4 grid gap-4">
                    <StarRating rating={rating} setRating={setRating} />
                    <textarea
                      required
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      placeholder="Was it worth the price? Tell us more..."
                      className="w-full rounded-2xl border border-neutral-200 bg-white p-4 text-sm outline-none focus:border-neutral-950"
                      rows={4}
                    />
                    {error && <p className="text-xs font-semibold text-red-600">{error}</p>}
                    <Button type="submit" disabled={isSubmitting} className="w-full rounded-xl py-6">
                      {isSubmitting ? <Loader2 className="mr-2 size-4 animate-spin" /> : null}
                      Submit Review
                    </Button>
                  </form>
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed border-neutral-300 p-6 text-center">
                  <ShoppingCart className="mx-auto size-6 text-neutral-300" />
                  <p className="mt-3 text-sm font-medium text-neutral-500 leading-relaxed">
                    You can only review items you've purchased and received.
                  </p>
                </div>
              )
            ) : (
              <div className="rounded-2xl bg-neutral-100 p-6 text-center">
                <p className="text-sm font-medium text-neutral-600">
                  Please <Link href="/auth" className="font-bold text-neutral-950 underline">sign in</Link> to leave a review.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Reviews Feed */}
        <div className="p-8 sm:p-12">
          {isLoading ? (
            <div className="flex justify-center py-20"><Loader2 className="size-8 animate-spin text-neutral-200" /></div>
          ) : reviews.length === 0 ? (
            <div className="py-20 text-center">
              <div className="mx-auto grid size-16 place-items-center rounded-full bg-neutral-50 text-neutral-200">
                <MessageSquare className="size-8" />
              </div>
              <h3 className="mt-4 text-lg font-bold text-neutral-900">No reviews yet</h3>
              <p className="mt-1 text-sm text-neutral-500">Be the first to share your experience with this product.</p>
            </div>
          ) : (
            <div className="space-y-12">
              <AnimatePresence mode="popLayout">
                {reviews.map((review, i) => (
                  <motion.div
                    key={review.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="group"
                  >
                    <div className="flex items-start gap-4">
                      <div className="grid size-12 place-items-center rounded-2xl bg-neutral-100 text-neutral-400 group-hover:bg-neutral-950 group-hover:text-white transition-colors">
                        <User className="size-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <h4 className="font-bold text-neutral-900">{review.userName}</h4>
                          <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">
                            {new Date(review.createdAt).toLocaleDateString("en-BD", { month: "short", day: "numeric", year: "numeric" })}
                          </span>
                        </div>
                        <div className="mt-1.5 flex items-center gap-3">
                          <StarRating rating={review.rating} readonly size="sm" />
                          {review.isVerified !== false && (
                            <div className="flex items-center gap-1 text-[10px] font-black uppercase text-emerald-600 tracking-tighter">
                              <CheckCircle2 className="size-3" />
                              Verified Purchase
                            </div>
                          )}
                        </div>
                        <p className="mt-4 text-sm leading-relaxed text-neutral-700 whitespace-pre-wrap">
                          {review.comment}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
