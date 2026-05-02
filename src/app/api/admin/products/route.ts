import { NextRequest, NextResponse } from "next/server";
import { collection, addDoc } from "firebase-admin/firestore";
import { getFirebaseAdminApp, verifyAdminIdToken } from "@/lib/firebase/admin";
import { getFirestore } from "firebase-admin/firestore";

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization") || request.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ success: false, error: "Missing Authorization" }, { status: 401 });
    }

    const idToken = authHeader.split(" ")[1];
    await verifyAdminIdToken(idToken);

    const body = await request.json();
    if (!body || !body.name) {
      return NextResponse.json({ success: false, error: "Invalid product payload" }, { status: 400 });
    }

    const adminApp = getFirebaseAdminApp();
    const db = getFirestore(adminApp);
    const productsRef = collection(db, "products");

    const product = {
      ...body,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const docRef = await addDoc(productsRef, product);

    return NextResponse.json({ success: true, id: docRef.id, data: product }, { status: 201 });
  } catch (error) {
    console.error("Admin create product error:", error);
    return NextResponse.json({ success: false, error: error instanceof Error ? error.message : String(error) }, { status: 500 });
  }
}
