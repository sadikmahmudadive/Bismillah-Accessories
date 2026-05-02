import { NextRequest, NextResponse } from "next/server";

import { verifyAdminIdToken, getFirestoreDb } from "@/lib/firebase/admin";
import { getFirebaseAuth } from "@/lib/firebase/server-auth";
import type { OrderStatus } from "@/types/domain";

const ORDER_STATUSES: OrderStatus[] = [
  "pending",
  "confirmed",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
];

type RouteContext = { params: Promise<{ id: string }> };

// GET /api/orders/:id — fetch a single order (owner or admin)
export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const authHeader = request.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.slice(7);
    const auth = getFirebaseAuth();
    let decodedToken;
    try {
      decodedToken = await auth.verifyIdToken(token);
    } catch {
      return NextResponse.json({ success: false, error: "Invalid token" }, { status: 401 });
    }

    const db = getFirestoreDb();
    const doc = await db.collection("orders").doc(id).get();

    if (!doc.exists) {
      return NextResponse.json({ success: false, error: "Order not found" }, { status: 404 });
    }

    const data = doc.data()!;

    // Allow only the owner or admins to read the order
    const userDoc = await db.collection("users").doc(decodedToken.uid).get();
    const isAdmin = userDoc.exists && userDoc.data()?.role === "admin";

    if (data.userId !== decodedToken.uid && !isAdmin) {
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json({
      success: true,
      data: {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate?.()?.toISOString?.() ?? data.createdAt,
        updatedAt: data.updatedAt?.toDate?.()?.toISOString?.() ?? data.updatedAt,
      },
    });
  } catch (error) {
    console.error("[GET /api/orders/:id]", error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Error" },
      { status: 500 }
    );
  }
}

// PATCH /api/orders/:id — admin: update order status
export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const authHeader = request.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.slice(7);
    await verifyAdminIdToken(token); // throws if not admin

    const { status } = await request.json();
    if (!ORDER_STATUSES.includes(status as OrderStatus)) {
      return NextResponse.json({ success: false, error: "Invalid status" }, { status: 400 });
    }

    const db = getFirestoreDb();
    const docRef = db.collection("orders").doc(id);
    const doc = await docRef.get();

    if (!doc.exists) {
      return NextResponse.json({ success: false, error: "Order not found" }, { status: 404 });
    }

    await docRef.update({ status, updatedAt: new Date() });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[PATCH /api/orders/:id]", error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Error" },
      { status: 500 }
    );
  }
}
