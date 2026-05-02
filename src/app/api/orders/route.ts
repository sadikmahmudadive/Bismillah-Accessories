import { NextRequest, NextResponse } from "next/server";

import { verifyAdminIdToken, getFirestoreDb } from "@/lib/firebase/admin";
import { getFirebaseAuth } from "@/lib/firebase/server-auth";
import type { OrderStatus, PaymentMethod } from "@/types/domain";

// POST /api/orders — create a new order (authenticated customer)
export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.slice(7);

    // Verify the token (any authenticated user, not just admin)
    const auth = getFirebaseAuth();
    let decodedToken;
    try {
      decodedToken = await auth.verifyIdToken(token);
    } catch {
      return NextResponse.json({ success: false, error: "Invalid token" }, { status: 401 });
    }

    const body = await request.json();
    const {
      customerName,
      customerEmail,
      phone,
      address,
      items,
      subtotal,
      deliveryFee,
      total,
      paymentMethod,
      bkashTransactionId,
    } = body;

    // Basic validation
    if (!customerName || !phone || !address || !items?.length) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    if (!["cash_on_delivery", "bkash_mock"].includes(paymentMethod as string)) {
      return NextResponse.json(
        { success: false, error: "Invalid payment method" },
        { status: 400 }
      );
    }

    const db = getFirestoreDb();
    const now = new Date();

    const orderData = {
      userId: decodedToken.uid,
      customerEmail: customerEmail || decodedToken.email || "",
      customerName: String(customerName).trim(),
      phone: String(phone).trim(),
      address: String(address).trim(),
      items,
      subtotal: Number(subtotal) || 0,
      deliveryFee: Number(deliveryFee) || 0,
      total: Number(total) || 0,
      paymentMethod: paymentMethod as PaymentMethod,
      status: "pending" as OrderStatus,
      ...(bkashTransactionId ? { bkashTransactionId: String(bkashTransactionId).trim() } : {}),
      createdAt: now,
      updatedAt: now,
    };

    const docRef = await db.collection("orders").add(orderData);

    return NextResponse.json({ success: true, orderId: docRef.id });
  } catch (error) {
    console.error("[POST /api/orders]", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to create order",
      },
      { status: 500 }
    );
  }
}

// GET /api/orders — admin: list all orders
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.slice(7);
    await verifyAdminIdToken(token); // throws if not admin

    const db = getFirestoreDb();
    const snapshot = await db
      .collection("orders")
      .orderBy("createdAt", "desc")
      .limit(200)
      .get();

    const orders = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      // Convert Firestore Timestamps to ISO strings for JSON serialisation
      createdAt: doc.data().createdAt?.toDate?.()?.toISOString?.() ?? doc.data().createdAt,
      updatedAt: doc.data().updatedAt?.toDate?.()?.toISOString?.() ?? doc.data().updatedAt,
    }));

    return NextResponse.json({ success: true, data: orders });
  } catch (error) {
    console.error("[GET /api/orders]", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to fetch orders",
      },
      { status: 500 }
    );
  }
}
