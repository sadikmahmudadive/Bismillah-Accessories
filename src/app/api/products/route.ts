import { NextRequest, NextResponse } from "next/server";
import { getFirebaseAdminApp } from "@/lib/firebase/admin";
import { getFirestore } from "firebase-admin/firestore";
import type { Product } from "@/types/domain";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const category = searchParams.get("category");
    const search = searchParams.get("search");
    const sortBy = searchParams.get("sortBy") || "name"; // "name", "price_asc", "price_desc", "newest"
    const pageSize = parseInt(searchParams.get("pageSize") || "12", 10);
    const page = parseInt(searchParams.get("page") || "0", 10);

    const adminApp = getFirebaseAdminApp();
    const db = getFirestore(adminApp);

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
      data: products,
      hasMore,
      page,
      pageSize,
      total: products.length,
    });
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
