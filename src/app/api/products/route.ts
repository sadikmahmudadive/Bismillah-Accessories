import { getFirestoreDb } from "@/lib/firebase/admin";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") || "active";
    const limit = parseInt(searchParams.get("limit") || "100");
    const sortBy = searchParams.get("sortBy") || "newest";

    const db = getFirestoreDb();
    // Query by status only — no compound index needed
    const snapshot = await db
      .collection("products")
      .where("status", "==", status)
      .limit(limit)
      .get();

    let products = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Record<string, unknown>[];

    // Sort in-memory to avoid requiring a composite Firestore index
    if (sortBy === "newest") {
      products = products.sort((a, b) => {
        const aTime =
          (a.createdAt as { _seconds?: number } | null)?._seconds ?? 0;
        const bTime =
          (b.createdAt as { _seconds?: number } | null)?._seconds ?? 0;
        return bTime - aTime;
      });
    } else if (sortBy === "name") {
      products = products.sort((a, b) =>
        String(a.name ?? "").localeCompare(String(b.name ?? ""))
      );
    }

    return NextResponse.json({
      success: true,
      data: products,
      total: products.length,
    });
  } catch (error) {
    console.error("Error fetching products:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch products" },
      { status: 500 }
    );
  }
}

// POST /api/products — admin: create a product
export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get("Authorization");

    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json(
        { success: false, error: "Unauthorized: Missing token" },
        { status: 401 }
      );
    }

    const token = authHeader.slice(7);
    const { verifyAdminIdToken } = await import("@/lib/firebase/admin");
    await verifyAdminIdToken(token); // Throws if not admin

    const body = await request.json();
    const db = getFirestoreDb();
    
    const docRef = await db.collection("products").add({
      ...body,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return NextResponse.json({
      success: true,
      data: { id: docRef.id },
      message: "Product created successfully",
    });
  } catch (error) {
    console.error("[POST /api/products]", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to create product",
      },
      { status: 500 }
    );
  }
}