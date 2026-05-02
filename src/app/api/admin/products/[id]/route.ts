import { NextRequest, NextResponse } from "next/server";
import { doc, updateDoc, deleteDoc, getDoc } from "firebase-admin/firestore";
import { getFirebaseAdminApp, verifyAdminIdToken } from "@/lib/firebase/admin";
import { getFirestore } from "firebase-admin/firestore";

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const authHeader = request.headers.get("authorization") || request.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ success: false, error: "Missing Authorization" }, { status: 401 });
    }

    const idToken = authHeader.split(" ")[1];
    await verifyAdminIdToken(idToken);

    const { id } = await params;
    if (!id) return NextResponse.json({ success: false, error: "Missing product id" }, { status: 400 });

    const body = await request.json();
    if (!body) return NextResponse.json({ success: false, error: "Invalid payload" }, { status: 400 });

    const adminApp = getFirebaseAdminApp();
    const db = getFirestore(adminApp);
    const productRef = doc(db, "products", id);

    const snapshot = await getDoc(productRef);
    if (!snapshot.exists()) return NextResponse.json({ success: false, error: "Product not found" }, { status: 404 });

    const updatePayload = { ...body, updatedAt: new Date().toISOString() };
    await updateDoc(productRef, updatePayload as any);

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

    const adminApp = getFirebaseAdminApp();
    const db = getFirestore(adminApp);
    const productRef = doc(db, "products", id);

    await deleteDoc(productRef);

    return NextResponse.json({ success: true, id });
  } catch (error) {
    console.error("Admin delete product error:", error);
    return NextResponse.json({ success: false, error: error instanceof Error ? error.message : String(error) }, { status: 500 });
  }
}
