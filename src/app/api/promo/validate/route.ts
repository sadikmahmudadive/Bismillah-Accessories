import { NextRequest, NextResponse } from "next/server";
import { getFirestoreDb } from "@/lib/firebase/admin";
import type { PromoCode } from "@/types/domain";

export async function POST(request: NextRequest) {
  try {
    const { code, subtotal } = await request.json();

    if (!code) {
      return NextResponse.json({ success: false, error: "Promo code is required" }, { status: 400 });
    }

    const db = getFirestoreDb();
    const snapshot = await db
      .collection("promo_codes")
      .where("code", "==", code.toUpperCase().trim())
      .where("isActive", "==", true)
      .limit(1)
      .get();

    if (snapshot.empty) {
      return NextResponse.json({ success: false, error: "Invalid or inactive promo code" }, { status: 404 });
    }

    const promoDoc = snapshot.docs[0];
    const promo = { id: promoDoc.id, ...promoDoc.data() } as PromoCode;

    // 1. Expiry check
    if (promo.expiryDate) {
      const expiry = promo.expiryDate.toDate();
      if (new Date() > expiry) {
        return NextResponse.json({ success: false, error: "This promo code has expired" }, { status: 400 });
      }
    }

    // 2. Usage limit check
    if (promo.usageLimit && promo.usageCount >= promo.usageLimit) {
      return NextResponse.json({ success: false, error: "This promo code has reached its usage limit" }, { status: 400 });
    }

    // 3. Min order amount check
    if (promo.minOrderAmount && subtotal < promo.minOrderAmount) {
      return NextResponse.json({ 
        success: false, 
        error: `This code requires a minimum order of ৳${promo.minOrderAmount.toLocaleString()}` 
      }, { status: 400 });
    }

    // 4. Calculate discount
    let discountAmount = 0;
    if (promo.type === "percentage") {
      discountAmount = (subtotal * promo.value) / 100;
      if (promo.maxDiscountAmount && discountAmount > promo.maxDiscountAmount) {
        discountAmount = promo.maxDiscountAmount;
      }
    } else {
      discountAmount = promo.value;
    }

    // Ensure discount doesn't exceed subtotal
    discountAmount = Math.min(discountAmount, subtotal);

    return NextResponse.json({
      success: true,
      data: {
        id: promo.id,
        code: promo.code,
        type: promo.type,
        value: promo.value,
        discountAmount: Math.floor(discountAmount),
      }
    });
  } catch (error) {
    console.error("[POST /api/promo/validate]", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
