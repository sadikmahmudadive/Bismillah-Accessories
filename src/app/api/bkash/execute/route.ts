import { NextRequest, NextResponse } from "next/server";
import { executePayment } from "@/lib/bkash";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { paymentID } = body;

    if (!paymentID) {
      return NextResponse.json(
        { success: false, error: "Payment ID is required" },
        { status: 400 }
      );
    }

    const executeData = await executePayment(paymentID);
    return NextResponse.json({ success: true, ...executeData });
  } catch (error: any) {
    console.error("[bKash Execute Route Error]", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to execute payment" },
      { status: 500 }
    );
  }
}
