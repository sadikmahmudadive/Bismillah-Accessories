import { NextRequest, NextResponse } from "next/server";
import { getFirebaseAdminApp, verifyAdminIdToken, getFirestoreDb } from "@/lib/firebase/admin";

export async function POST(request: NextRequest) {
  try {
    console.log("[POST /api/admin/products] Starting product creation...");

    const authHeader = request.headers.get("authorization") || request.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      console.error("[POST /api/admin/products] Missing or invalid Authorization header");
      return NextResponse.json({
        success: false,
        error: "Missing Authorization header. Expected 'Bearer <token>'"
      }, { status: 401 });
    }

    const idToken = authHeader.split(" ")[1];
    if (!idToken) {
      console.error("[POST /api/admin/products] Missing token in Authorization header");
      return NextResponse.json({
        success: false,
        error: "Missing token in Authorization header"
      }, { status: 401 });
    }

    console.log("[POST /api/admin/products] Verifying admin token...");
    const decodedToken = await verifyAdminIdToken(idToken);
    console.log(`[POST /api/admin/products] Admin verified: ${decodedToken.uid}`);

    const body = await request.json();
    console.log("[POST /api/admin/products] Received body:", body);

    if (!body || !body.name) {
      console.error("[POST /api/admin/products] Invalid product payload");
      return NextResponse.json({
        success: false,
        error: "Invalid product payload. 'name' field is required."
      }, { status: 400 });
    }

    console.log("[POST /api/admin/products] Getting Firestore instance...");
    let db;
    try {
      db = getFirestoreDb();
    } catch (dbError) {
      console.error("[POST /api/admin/products] Failed to get Firestore instance:", dbError);
      throw new Error("Firestore database connection failed. Please ensure Firestore is enabled and service account is configured.");
    }

    const product = {
      ...body,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    console.log("[POST /api/admin/products] Adding product to Firestore...");
    try {
      const docRef = await db.collection("products").add(product);
      console.log(`[POST /api/admin/products] Product created successfully with ID: ${docRef.id}`);
      return NextResponse.json({
        success: true,
        id: docRef.id,
        data: product
      }, { status: 201 });
    } catch (firestoreError: any) {
      console.error("[POST /api/admin/products] Firestore write failed:", firestoreError);
      throw new Error(`Failed to save product to database: ${firestoreError.message}`);
    }

  } catch (error) {
    console.error("[POST /api/admin/products] Error:", error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : String(error),
      details: error instanceof Error ? error.stack : undefined
    }, { status: 500 });
  }
}
