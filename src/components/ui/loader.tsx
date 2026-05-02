import { cn } from "@/lib/utils";

type SkeletonProps = {
  className?: string;
};

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl bg-neutral-200/70 before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_1.7s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/70 before:to-transparent",
        className,
      )}
    />
  );
}

export function ProductCardSkeleton() {
  return (
    <div className="rounded-[1.75rem] border border-neutral-200 bg-white p-3 shadow-sm">
      <Skeleton className="aspect-[4/3] rounded-[1.35rem]" />
      <div className="space-y-3 p-3">
        <Skeleton className="h-4 w-3/4 rounded-full" />
        <Skeleton className="h-3 w-1/2 rounded-full" />
        <div className="flex items-center justify-between pt-1">
          <Skeleton className="h-4 w-16 rounded-full" />
          <Skeleton className="h-9 w-9 rounded-full" />
        </div>
      </div>
    </div>
  );
}
