import { NextRequest, NextResponse } from "next/server";
import { getFirebaseAdminApp, getFirestoreDb } from "@/lib/firebase/admin";
import type { Product } from "@/types/domain";

// Mock products for fallback when Firestore is unavailable
const MOCK_PRODUCTS: Product[] = [
  {
    id: "1",
    name: "Hijab - Classic Black",
    slug: "hijab-classic-black",
    description: "Premium quality hijab in classic black with comfortable fit",
    price: 15.99,
    stock: 50,
    imageUrl: "https://images.unsplash.com/photo-1509631179647-0177331693ae?w=500",
    category: "hijabs",
    tags: ["hijab", "black", "classic"],
    status: "active" as const,
    createdAt: { seconds: 0, nanoseconds: 0 } as any,
    updatedAt: { seconds: 0, nanoseconds: 0 } as any,
  },
  {
    id: "2",
    name: "Prayer Mat - Floral Design",
    slug: "prayer-mat-floral",
    description: "Beautiful prayer mat with intricate floral patterns",
    price: 24.99,
    stock: 25,
    imageUrl: "https://images.unsplash.com/photo-1603808033192-082d6919d3e1?w=500",
    category: "prayer-mats",
    tags: ["prayer", "mat", "floral"],
    status: "active" as const,
    createdAt: { seconds: 0, nanoseconds: 0 } as any,
    updatedAt: { seconds: 0, nanoseconds: 0 } as any,
  },
  {
    id: "3",
    name: "Abaya - Elegant Black",
    slug: "abaya-elegant",
    description: "Elegant and comfortable black abaya for everyday wear",
    price: 49.99,
    stock: 15,
    imageUrl: "https://images.unsplash.com/photo-1539622066829-3e23aba3f4e8?w=500",
    category: "abayas",
    tags: ["abaya", "black", "elegant"],
    status: "active" as const,
    createdAt: { seconds: 0, nanoseconds: 0 } as any,
    updatedAt: { seconds: 0, nanoseconds: 0 } as any,
  },
  {
    id: "4",
    name: "Hijab Pins - Gold",
    slug: "hijab-pins-gold",
    description: "Decorative gold hijab pins set of 3",
    price: 8.99,
    stock: 100,
    imageUrl: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=500",
    category: "accessories",
    tags: ["pins", "gold", "hijab"],
    status: "active" as const,
    createdAt: { seconds: 0, nanoseconds: 0 } as any,
    updatedAt: { seconds: 0, nanoseconds: 0 } as any,
  },
  {
    id: "5",
    name: "Niqab - Premium",
    slug: "niqab-premium",
    description: "Premium quality niqab with comfortable breathable fabric",
    price: 29.99,
    stock: 30,
    imageUrl: "https://images.unsplash.com/photo-1577591804779-591b32be3338?w=500",
    category: "niqabs",
    tags: ["niqab", "premium"],
    status: "active" as const,
    createdAt: { seconds: 0, nanoseconds: 0 } as any,
    updatedAt: { seconds: 0, nanoseconds: 0 } as any,
  },
];

export async function GET(request: NextRequest) {
  try {
    console.log("[products route] GET request started");
    const searchParams = request.nextUrl.searchParams;
    const category = searchParams.get("category");
    const search = searchParams.get("search");
    const sortBy = searchParams.get("sortBy") || "name"; // "name", "price_asc", "price_desc", "newest"
    const pageSize = parseInt(searchParams.get("pageSize") || "12", 10);
    const page = parseInt(searchParams.get("page") || "0", 10);

    console.log("[products route] Getting admin app...");
    const adminApp = getFirebaseAdminApp();
    console.log("[products route] Admin app obtained, getting Firestore db...");
    const db = getFirestoreDb();
    console.log("[products route] Firestore db obtained successfully");

    try {
      // Build admin SDK query using instance methods to avoid mixing client/module APIs
      let qRef: FirebaseFirestore.Query = db.collection("products");
      qRef = qRef.where("status", "==", "active");

      if (category && category !== "all") {
        qRef = qRef.where("category", "==", category);
      }

      // Avoid composite-index requirements by doing ordering/pagination in memory.
      // Fetch a reasonable cap of documents and sort/paginate below.
      const FETCH_CAP = Math.max(1000, pageSize * 20);
      qRef = qRef.limit(FETCH_CAP);

      const snapshot = await qRef.get();

      // Convert docs to plain objects and apply server-side search/sort/pagination
      let docs = snapshot.docs;
      if (search) {
        const searchLower = search.toLowerCase();
        docs = docs.filter((doc) => {
          const data = doc.data() as Product;
          return (
            data.name.toLowerCase().includes(searchLower) ||
            data.description.toLowerCase().includes(searchLower) ||
            data.tags.some((tag) => tag.toLowerCase().includes(searchLower))
          );
        });
      }

      // Map to product objects
      let products = docs.map((doc) => ({ ...(doc.data() as Product), id: doc.id })) as Product[];

      // Sort in-memory according to sortBy
      if (sortBy === "price_asc") {
        products.sort((a, b) => a.price - b.price);
      } else if (sortBy === "price_desc") {
        products.sort((a, b) => b.price - a.price);
      } else if (sortBy === "newest") {
        products.sort((a, b) => {
          const da = (a as any).createdAt ? new Date((a as any).createdAt) : new Date(0);
          const db = (b as any).createdAt ? new Date((b as any).createdAt) : new Date(0);
          return db.getTime() - da.getTime();
        });
      } else {
        products.sort((a, b) => a.name.localeCompare(b.name));
      }

      // Pagination
      const start = page * pageSize;
      const paged = products.slice(start, start + pageSize);
      const hasMore = start + pageSize < products.length;

      return NextResponse.json({
        success: true,
        data: paged,
        hasMore,
        page,
        pageSize,
        total: products.length,
      });
    } catch (firestoreError: any) {
      console.warn(
        "[products route] Firestore query failed, using mock data:",
        firestoreError?.message
      );
      console.warn(
        "[products route] To fix Firestore access:",
        "1. Create a Firestore database in Firebase Console",
        "2. Ensure service account has 'Cloud Datastore User' role",
        "3. Check FIREBASE_ADMIN_* environment variables"
      );

      // Fallback to mock products
      let products = [...MOCK_PRODUCTS];

      // Apply category filter
      if (category && category !== "all") {
        products = products.filter((p) => p.category === category);
      }

      // Apply search filter
      if (search) {
        const searchLower = search.toLowerCase();
        products = products.filter(
          (p) =>
            p.name.toLowerCase().includes(searchLower) ||
            p.description.toLowerCase().includes(searchLower) ||
            p.tags.some((tag) => tag.toLowerCase().includes(searchLower))
        );
      }

      // Apply sorting
      if (sortBy === "price_asc") {
        products.sort((a, b) => a.price - b.price);
      } else if (sortBy === "price_desc") {
        products.sort((a, b) => b.price - a.price);
      } else if (sortBy === "newest") {
        products.sort((a, b) => {
          const da = (a as any).createdAt ? new Date((a as any).createdAt) : new Date(0);
          const db = (b as any).createdAt ? new Date((b as any).createdAt) : new Date(0);
          return db.getTime() - da.getTime();
        });
      } else {
        products.sort((a, b) => a.name.localeCompare(b.name));
      }

      // Pagination
      const start = page * pageSize;
      const paged = products.slice(start, start + pageSize);
      const hasMore = start + pageSize < products.length;

      return NextResponse.json({
        success: true,
        data: paged,
        hasMore,
        page,
        pageSize,
        total: products.length,
        _mock: true,
        _note: "Using mock data - Firestore authentication pending. Grant service account 'Cloud Datastore User' role in GCP Console.",
      });
    }
  } catch (error) {
    console.error("Error fetching products:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch products",
        message: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
