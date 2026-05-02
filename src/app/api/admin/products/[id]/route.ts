import { NextRequest, NextResponse } from "next/server";
import { getFirebaseAdminApp, verifyAdminIdToken, getFirestoreDb } from "@/lib/firebase/admin";

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const authHeader = request.headers.get("authorization") || request.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      console.error("[PUT /api/admin/products/[id]] Missing or invalid Authorization header");
      return NextResponse.json({ success: false, error: "Missing Authorization" }, { status: 401 });
    }

    const idToken = authHeader.split(" ")[1];
    console.log("[PUT /api/admin/products/[id]] Verifying token...");
    
    try {
      await verifyAdminIdToken(idToken);
    } catch (authErr) {
      console.error("[PUT /api/admin/products/[id]] Token verification failed:", authErr);
      throw authErr;
    }

    const { id } = await params;
    if (!id) return NextResponse.json({ success: false, error: "Missing product id" }, { status: 400 });

    const body = await request.json();
    if (!body) return NextResponse.json({ success: false, error: "Invalid payload" }, { status: 400 });

    const db = getFirestoreDb();
    const productRef = db.doc(`products/${id}`);

    const snapshot = await productRef.get();
    if (!snapshot.exists) return NextResponse.json({ success: false, error: "Product not found" }, { status: 404 });

    const updatePayload = { ...body, updatedAt: new Date().toISOString() };
    await productRef.update(updatePayload as any);

    console.log(`[PUT /api/admin/products/[id]] Product ${id} updated successfully`);
    return NextResponse.json({ success: true, id, data: updatePayload });
  } catch (error) {
    console.error("Admin update product error:", error);
    return NextResponse.json({ success: false, error: error instanceof Error ? error.message : String(error) }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const authHeader = request.headers.get("authorization") || request.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ success: false, error: "Missing Authorization" }, { status: 401 });
    }

    const idToken = authHeader.split(" ")[1];
    await verifyAdminIdToken(idToken);

    const { id } = await params;
    if (!id) return NextResponse.json({ success: false, error: "Missing product id" }, { status: 400 });

    const db = getFirestoreDb();
    const productRef = db.doc(`products/${id}`);

    await productRef.delete();

    return NextResponse.json({ success: true, id });
  } catch (error) {
    console.error("Admin delete product error:", error);
    return NextResponse.json({ success: false, error: error instanceof Error ? error.message : String(error) }, { status: 500 });
  }
}
