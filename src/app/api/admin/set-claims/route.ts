import { NextRequest, NextResponse } from "next/server";
import { setAdminCustomClaim, verifyAdminIdToken } from "@/lib/firebase/admin";

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization") || request.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json(
        { success: false, error: "Missing Authorization header" },
        { status: 401 }
      );
    }

    const idToken = authHeader.split(" ")[1];
    const decodedToken = await verifyAdminIdToken(idToken);

    const body = await request.json();
    const { targetUid, isAdmin } = body;

    if (!targetUid || typeof isAdmin !== "boolean") {
      return NextResponse.json(
        { success: false, error: "Invalid payload. Required: targetUid (string), isAdmin (boolean)" },
        { status: 400 }
      );
    }

    await setAdminCustomClaim(targetUid, isAdmin);

    return NextResponse.json({
      success: true,
      message: `Successfully set custom claim { admin: ${isAdmin} } for target UID ${targetUid}`,
      requestedBy: decodedToken.uid,
    });
  } catch (error) {
    console.error("[POST /api/admin/set-claims] Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
