import type { Metadata } from "next";
import { FavoritesDisplay } from "@/components/product/favorites-display";

export const metadata: Metadata = {
  title: "Favorites",
  description: "Your favorited products.",
};

export default function FavoritesPage() {
  return (
    <main className="bg-transparent px-4 py-12 sm:px-6 lg:px-8 min-h-[calc(100svh-16rem)]">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 text-center sm:text-left">
          <h1 className="text-4xl font-semibold tracking-normal text-neutral-950">
            Your Favorites
          </h1>
          <p className="mt-3 text-base leading-6 text-neutral-600">
            Items you've saved for later.
          </p>
        </div>

        <FavoritesDisplay />
      </div>
    </main>
  );
}
