import { getFirestoreDb } from "@/lib/firebase/admin";
import type { Product, OfferBanner } from "@/types/domain";

/**
 * Fetches all necessary data for the homepage on the server side.
 */
export async function getHomeData() {
  const db = getFirestoreDb();
  
  try {
    // 1. Fetch Banners
    const bannersSnap = await db.collection("banners")
      .where("isActive", "==", true)
      .get();
      
    const banners = bannersSnap.docs
      .map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          title: data.title ?? "",
          subtitle: data.subtitle ?? "",
          imageUrl: data.imageUrl ?? "",
          link: data.link ?? "",
          buttonText: data.buttonText ?? "",
          isActive: data.isActive ?? false,
          order: data.order ?? 0,
        } as any;
      })
      .sort((a, b) => (a.order || 0) - (b.order || 0));

    // 2. Fetch Featured Products (Newest 4)
    const productsSnap = await db.collection("products")
      .where("status", "==", "active")
      .limit(20)
      .get();

    const products = productsSnap.docs
      .map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          name: data.name ?? "",
          slug: data.slug ?? "",
          description: data.description ?? "",
          category: data.category ?? "",
          price: data.price ?? 0,
          stock: data.stock ?? 0,
          imageUrl: data.imageUrl ?? "",
          averageRating: data.averageRating ?? 0,
          reviewCount: data.reviewCount ?? 0,
          status: data.status ?? "active",
          // Only pass the plain seconds for the client to use
          createdAt: data.createdAt ? { _seconds: data.createdAt._seconds } : null,
        } as any;
      })
      .sort((a, b) => {
        const aTime = a.createdAt?._seconds ?? 0;
        const bTime = b.createdAt?._seconds ?? 0;
        return bTime - aTime;
      })
      .slice(0, 4);

    return {
      banners,
      products
    };
  } catch (error) {
    console.error("Error fetching home data on server:", error);
    return {
      banners: [],
      products: []
    };
  }
}
