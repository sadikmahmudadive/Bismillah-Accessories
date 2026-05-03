"use client";

import { useEffect, useState } from "react";
import { Star, Loader2, User } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

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
  const [isLoading, setIsLoading] = useState(true);
  
  // Form state
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const hasReviewed = reviews.some(r => r.userId === user?.uid);

  useEffect(() => {
    fetchReviews();
  }, [productId]);

  async function fetchReviews() {
    try {
      const res = await fetch(`/api/products/${productId}/reviews`);
      const payload = await res.json();
      if (payload.success) {
        setReviews(payload.data);
      }
    } catch (err) {
      console.error("Failed to load reviews", err);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    
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
        body: JSON.stringify({ rating, comment })
      });
      
      const payload = await res.json();
      
      if (!res.ok || !payload.success) {
        throw new Error(payload.error || "Failed to submit review");
      }
      
      // Refresh reviews
      await fetchReviews();
      setComment("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="mt-16 rounded-[2rem] border border-neutral-200/60 bg-white/60 p-6 shadow-sm backdrop-blur-xl sm:p-8">
      <h2 className="text-2xl font-semibold text-neutral-950">Customer Reviews</h2>
      
      {/* Review Form */}
      {user && !hasReviewed ? (
        <div className="mt-8 rounded-[1.5rem] bg-white p-5 shadow-sm border border-neutral-100">
          <h3 className="text-sm font-semibold text-neutral-900">Write a review</h3>
          <form onSubmit={handleSubmit} className="mt-4 grid gap-4">
            <StarRating rating={rating} setRating={setRating} />
            <textarea
              required
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="What did you think about this product?"
              className="w-full rounded-xl border border-neutral-200 bg-[#fafaf8] p-3 text-sm outline-none focus:border-neutral-950 focus:bg-white"
              rows={3}
            />
            {error && <p className="text-xs font-semibold text-[#d65f5f]">{error}</p>}
            <Button type="submit" disabled={isSubmitting} className="w-fit">
              {isSubmitting ? <Loader2 className="mr-2 size-4 animate-spin" /> : null}
              Submit Review
            </Button>
          </form>
        </div>
      ) : user && hasReviewed ? (
        <p className="mt-6 text-sm font-medium text-[#2f9e74]">Thanks for reviewing this product!</p>
      ) : (
        <p className="mt-6 text-sm text-neutral-600">Please <a href="/auth" className="font-semibold underline hover:text-neutral-950">sign in</a> to write a review.</p>
      )}

      {/* Reviews List */}
      <div className="mt-10 grid gap-6">
        {isLoading ? (
          <div className="flex justify-center py-8"><Loader2 className="size-6 animate-spin text-neutral-400" /></div>
        ) : reviews.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-neutral-300 py-12 text-center">
            <p className="text-sm text-neutral-500">No reviews yet. Be the first to review!</p>
          </div>
        ) : (
          <AnimatePresence>
            {reviews.map((review, i) => (
              <motion.div
                key={review.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="flex gap-4 border-b border-neutral-200/60 pb-6 last:border-0 last:pb-0"
              >
                <div className="grid size-10 shrink-0 place-items-center rounded-full bg-neutral-100 text-neutral-400">
                  <User className="size-5" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-neutral-950">{review.userName}</p>
                    <time className="text-xs text-neutral-500">
                      {new Date(review.createdAt).toLocaleDateString()}
                    </time>
                  </div>
                  <div className="mt-1">
                    <StarRating rating={review.rating} readonly size="sm" />
                  </div>
                  <p className="mt-3 text-sm leading-relaxed text-neutral-700">{review.comment}</p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>
    </section>
  );
}
