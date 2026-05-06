import { NextRequest, NextResponse } from "next/server";
import { getFirestoreDb } from "@/lib/firebase/admin";
import { getFirebaseAuth } from "@/lib/firebase/server-auth";

export async function PATCH(request: NextRequest) {
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

    const body = await request.json();
    const { displayName, phone, addresses, photoUrl } = body;

    const db = getFirestoreDb();
    const userRef = db.collection("users").doc(decodedToken.uid);

    const updateData: any = {
      updatedAt: new Date(),
    };

    if (displayName !== undefined) updateData.displayName = String(displayName).trim();
    if (phone !== undefined) updateData.phone = String(phone).trim();
    if (addresses !== undefined) updateData.addresses = addresses;
    if (photoUrl !== undefined) updateData.photoUrl = photoUrl;

    await userRef.set(updateData, { merge: true });

    // Also update Firebase Auth display name if provided
    if (displayName) {
      await auth.updateUser(decodedToken.uid, { displayName: String(displayName).trim() });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[PATCH /api/profile]", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}

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
    const userDoc = await db.collection("users").doc(decodedToken.uid).get();

    if (!userDoc.exists) {
      return NextResponse.json({ success: false, error: "Profile not found" }, { status: 404 });
    }

    const data = userDoc.data();
    return NextResponse.json({
      success: true,
      data: {
        ...data,
        createdAt: data?.createdAt?.toDate?.()?.toISOString() ?? null,
        updatedAt: data?.updatedAt?.toDate?.()?.toISOString() ?? null,
      }
    });
  } catch (error) {
    console.error("[GET /api/profile]", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
