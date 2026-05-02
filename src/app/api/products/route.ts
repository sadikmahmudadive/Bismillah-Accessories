import { NextRequest, NextResponse } from "next/server";
import {
  collection,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  QueryConstraint,
} from "firebase/firestore";
import { getFirestoreDb } from "@/lib/firebase/client";
import type { Product } from "@/types/domain";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const category = searchParams.get("category");
    const search = searchParams.get("search");
    const sortBy = searchParams.get("sortBy") || "name"; // "name", "price_asc", "price_desc", "newest"
    const pageSize = parseInt(searchParams.get("pageSize") || "12", 10);
    const page = parseInt(searchParams.get("page") || "0", 10);

    const db = getFirestoreDb();
    const productsRef = collection(db, "products");

    // Build query constraints
    const constraints: QueryConstraint[] = [where("status", "==", "active")];

    // Filter by category if provided
    if (category && category !== "all") {
      constraints.push(where("category", "==", category));
    }

    // Sort based on sortBy parameter
    if (sortBy === "price_asc") {
      constraints.push(orderBy("price", "asc"));
    } else if (sortBy === "price_desc") {
      constraints.push(orderBy("price", "desc"));
    } else if (sortBy === "newest") {
      constraints.push(orderBy("createdAt", "desc"));
    } else {
      constraints.push(orderBy("name", "asc"));
    }

    constraints.push(limit(pageSize + 1)); // Get one extra to check if more exist

    const q = query(productsRef, ...constraints);
    const snapshot = await getDocs(q);

    // Filter by search term if provided (client-side for simplicity)
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

    // Pagination
    const hasMore = docs.length > pageSize;
    const products = docs.slice(0, pageSize).map((doc) => ({
      ...doc.data(),
      id: doc.id,
    })) as Product[];

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
