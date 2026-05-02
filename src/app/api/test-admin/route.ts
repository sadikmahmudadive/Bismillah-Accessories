import { NextRequest, NextResponse } from "next/server";
import { verifyAdminIdToken } from "@/lib/firebase/admin";

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization") || request.headers.get("Authorization");

    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({
        success: false,
        error: "Missing Authorization header",
        received: authHeader ? "Header present but not Bearer token" : "No header"
      }, { status: 401 });
    }

    const idToken = authHeader.split(" ")[1];

    if (!idToken) {
      return NextResponse.json({
        success: false,
        error: "Missing token in Authorization header"
      }, { status: 401 });
    }

    console.log("[test-admin] Testing admin token verification...");
    const decodedToken = await verifyAdminIdToken(idToken);

    return NextResponse.json({
      success: true,
      message: "Admin authentication successful",
      user: {
        uid: decodedToken.uid,
        email: decodedToken.email,
        role: "admin"
      }
    });

  } catch (error) {
    console.error("[test-admin] Error:", error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : String(error),
      type: error instanceof Error ? error.constructor.name : "Unknown"
    }, { status: 500 });
  }
}