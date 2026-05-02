import { NextRequest, NextResponse } from "next/server";
import { getFirestoreDb } from "@/lib/firebase/admin";

export async function POST(request: NextRequest) {
  try {
    const { uid, email, displayName } = await request.json();

    if (!uid || !email) {
      return NextResponse.json(
        { success: false, error: "Missing required fields: uid, email" },
        { status: 400 }
      );
    }

    const db = getFirestoreDb();

    // Save user profile to Firestore
    await db.doc(`users/${uid}`).set({
      id: uid,
      email,
      displayName: displayName || email.split("@")[0] || "Customer",
      role: "customer",
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    console.log(`[save-profile] User profile created in Firestore for ${uid}`);
    return NextResponse.json({ success: true, id: uid }, { status: 201 });
  } catch (error) {
    console.error("[save-profile] Error saving user profile:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to save user profile",
        message: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
