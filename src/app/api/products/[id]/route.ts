import { NextRequest, NextResponse } from "next/server";
import { getFirebaseAdminApp, getFirestoreDb, verifyAdminIdToken } from "@/lib/firebase/admin";
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

    const db = getFirestoreDb();
    const snapshot = await db.doc(`products/${id}`).get();

    if (!snapshot.exists) {
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

// DELETE /api/products/:id — admin: delete a product
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const authHeader = request.headers.get("Authorization");

    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json(
        { success: false, error: "Unauthorized: Missing token" },
        { status: 401 }
      );
    }

    const token = authHeader.slice(7);
    await verifyAdminIdToken(token); // Throws if not admin

    const db = getFirestoreDb();
    const productRef = db.collection("products").doc(id);
    const productDoc = await productRef.get();

    if (!productDoc.exists) {
      return NextResponse.json(
        { success: false, error: "Product not found" },
        { status: 404 }
      );
    }

    await productRef.delete();

    return NextResponse.json({
      success: true,
      message: "Product deleted successfully",
    });
  } catch (error) {
    console.error("[DELETE /api/products/:id]", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to delete product",
      },
      { status: 500 }
    );
  }
}

// PUT /api/products/:id — admin: update a product
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const authHeader = request.headers.get("Authorization");

    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json(
        { success: false, error: "Unauthorized: Missing token" },
        { status: 401 }
      );
    }

    const token = authHeader.slice(7);
    await verifyAdminIdToken(token); // Throws if not admin

    const body = await request.json();
    const db = getFirestoreDb();
    const productRef = db.collection("products").doc(id);
    
    // First check if it exists
    const docSnap = await productRef.get();
    if (!docSnap.exists) {
      return NextResponse.json(
        { success: false, error: "Product not found" },
        { status: 404 }
      );
    }

    const currentData = docSnap.data();
    const previousStock = Number(currentData?.stock) || 0;
    const newStock = Number(body.stock);

    await productRef.update({
      ...body,
      updatedAt: new Date(),
    });

    // Log manual stock change if stock was updated
    if (!isNaN(newStock) && newStock !== previousStock) {
      try {
        const { logStockChange } = await import("@/lib/stock");
        const { getFirebaseAuth } = await import("@/lib/firebase/server-auth");
        const auth = getFirebaseAuth();
        const decodedToken = await auth.verifyIdToken(token);

        await logStockChange(
          id,
          body.name || currentData?.name || "Unknown Product",
          "manual_adjustment",
          newStock - previousStock,
          previousStock,
          newStock,
          undefined,
          decodedToken.uid
        );
      } catch (logError) {
        console.error("[PUT /api/products/:id] Stock log failed:", logError);
      }
    }

    return NextResponse.json({
      success: true,
      message: "Product updated successfully",
    });
  } catch (error) {
    console.error("[PUT /api/products/:id]", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to update product",
      },
      { status: 500 }
    );
  }
}
