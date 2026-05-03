import { NextRequest, NextResponse } from "next/server";
import { getFirestoreDb } from "@/lib/firebase/admin";
import type { Product } from "@/types/domain";

export async function GET(request: NextRequest) {
  try {
    // Use admin Firestore instance (same as working admin operations)
    const db = getFirestoreDb();

    // Query products using admin SDK
    const productsRef = db.collection("products");
    const snapshot = await productsRef.limit(50).get();

    let products = snapshot.docs.map((doc) => ({
      ...(doc.data() as Product),
      id: doc.id
    })) as Product[];

    return NextResponse.json({
      success: true,
      data: products,
      hasMore: false,
      page: 0,
      pageSize: 50,
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