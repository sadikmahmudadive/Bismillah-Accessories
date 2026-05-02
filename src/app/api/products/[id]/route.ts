import { NextRequest, NextResponse } from "next/server";
import { doc, getDoc } from "firebase-admin/firestore";
import { getFirebaseAdminApp, getFirestoreDb } from "@/lib/firebase/admin";
import type { Product } from "@/types/domain";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Product ID is required" },
        { status: 400 }
      );
    }

    const adminApp = getFirebaseAdminApp();
    const db = getFirestoreDb();
    const productRef = doc(db, "products", id);
    const snapshot = await getDoc(productRef);

    if (!snapshot.exists()) {
      return NextResponse.json(
        { success: false, error: "Product not found" },
        { status: 404 }
      );
    }

    const product = {
      ...snapshot.data(),
      id: snapshot.id,
    } as Product;

    // Only return active products (privacy)
    if (product.status !== "active") {
      return NextResponse.json(
        { success: false, error: "Product not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: product,
    });
  } catch (error) {
    console.error("Error fetching product:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch product",
        message: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
