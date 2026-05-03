import { NextRequest, NextResponse } from "next/server";
import { verifyAdminIdToken, getFirestoreDb } from "@/lib/firebase/admin";
import type { PromoCodeType } from "@/types/domain";

// GET /api/admin/promo - list all promo codes
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.slice(7);
    await verifyAdminIdToken(token);

    const db = getFirestoreDb();
    const snapshot = await db.collection("promo_codes").orderBy("createdAt", "desc").get();

    const promos = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      expiryDate: doc.data().expiryDate?.toDate?.()?.toISOString?.() ?? doc.data().expiryDate,
      createdAt: doc.data().createdAt?.toDate?.()?.toISOString?.() ?? doc.data().createdAt,
      updatedAt: doc.data().updatedAt?.toDate?.()?.toISOString?.() ?? doc.data().updatedAt,
    }));

    return NextResponse.json({ success: true, data: promos });
  } catch (error) {
    console.error("[GET /api/admin/promo]", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}

// POST /api/admin/promo - create a new promo code
export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.slice(7);
    await verifyAdminIdToken(token);

    const body = await request.json();
    const { 
      code, 
      type, 
      value, 
      minOrderAmount, 
      maxDiscountAmount, 
      expiryDate, 
      usageLimit 
    } = body;

    if (!code || !type || !value) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 });
    }

    const db = getFirestoreDb();
    
    // Check if code exists
    const existing = await db.collection("promo_codes").where("code", "==", code.toUpperCase().trim()).get();
    if (!existing.empty) {
      return NextResponse.json({ success: false, error: "Promo code already exists" }, { status: 400 });
    }

    const now = new Date();
    const promoData = {
      code: code.toUpperCase().trim(),
      type: type as PromoCodeType,
      value: Number(value),
      minOrderAmount: minOrderAmount ? Number(minOrderAmount) : null,
      maxDiscountAmount: maxDiscountAmount ? Number(maxDiscountAmount) : null,
      expiryDate: expiryDate ? new Date(expiryDate) : null,
      usageLimit: usageLimit ? Number(usageLimit) : null,
      usageCount: 0,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    };

    const docRef = await db.collection("promo_codes").add(promoData);

    return NextResponse.json({ success: true, id: docRef.id });
  } catch (error) {
    console.error("[POST /api/admin/promo]", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
