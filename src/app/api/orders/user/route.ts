import { NextRequest, NextResponse } from "next/server";
import { getFirestoreDb } from "@/lib/firebase/admin";
import { getFirebaseAuth } from "@/lib/firebase/server-auth";

export async function GET(request: NextRequest) {
  try {
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
    const snapshot = await db
      .collection("orders")
      .where("userId", "==", decodedToken.uid)
      .orderBy("createdAt", "desc")
      .limit(50)
      .get();

    const orders = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate?.()?.toISOString() ?? null,
      updatedAt: doc.data().updatedAt?.toDate?.()?.toISOString() ?? null,
    }));

    return NextResponse.json({ success: true, data: orders });
  } catch (error) {
    console.error("[GET /api/orders/user]", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
