import { NextRequest, NextResponse } from "next/server";
import { getFirestoreDb, verifyAdminIdToken } from "@/lib/firebase/admin";

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.slice(7);
    await verifyAdminIdToken(token); // Throws if not admin

    const db = getFirestoreDb();
    const snapshot = await db
      .collection("reviews")
      .orderBy("createdAt", "desc")
      .limit(500)
      .get();

    const reviews = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate?.()?.toISOString() ?? doc.data().createdAt,
    }));

    return NextResponse.json({ success: true, data: reviews });
  } catch (error) {
    console.error("[GET /api/admin/reviews]", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
