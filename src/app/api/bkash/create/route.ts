import { NextRequest, NextResponse } from "next/server";
import { createPayment } from "@/lib/bkash";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { amount, invoiceNumber } = body;

    if (!amount || !invoiceNumber) {
      return NextResponse.json(
        { success: false, error: "Amount and Invoice Number are required" },
        { status: 400 }
      );
    }

    const paymentData = await createPayment(amount, invoiceNumber);
    return NextResponse.json({ success: true, ...paymentData });
  } catch (error: any) {
    console.error("[bKash Create Route Error]", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to create payment" },
      { status: 500 }
    );
  }
}
