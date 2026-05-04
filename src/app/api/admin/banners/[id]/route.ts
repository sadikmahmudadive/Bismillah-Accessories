import { NextRequest, NextResponse } from "next/server";
import { getFirestoreDb } from "@/lib/firebase/admin";
import { verifyAdminIdToken } from "@/lib/firebase/admin";
import { FieldValue } from "firebase-admin/firestore";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authHeader = request.headers.get("Authorization");
    const { id } = await params;

    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.split(" ")[1];
    await verifyAdminIdToken(token);

    const body = await request.json();
    const db = getFirestoreDb();
    const bannerRef = db.collection("banners").doc(id);

    await bannerRef.update({
      ...body,
      updatedAt: FieldValue.serverTimestamp(),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Update banner error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authHeader = request.headers.get("Authorization");
    const { id } = await params;

    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.split(" ")[1];
    await verifyAdminIdToken(token);

    const db = getFirestoreDb();
    await db.collection("banners").doc(id).delete();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete banner error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
