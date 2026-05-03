import { NextRequest, NextResponse } from "next/server";

import { verifyAdminIdToken, getFirestoreDb } from "@/lib/firebase/admin";
import { getFirebaseAuth } from "@/lib/firebase/server-auth";
import type { OrderStatus, PaymentMethod } from "@/types/domain";
import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

// POST /api/orders — create a new order (authenticated customer)
export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.slice(7);

    // Verify the token (any authenticated user, not just admin)
    const auth = getFirebaseAuth();
    let decodedToken;
    try {
      decodedToken = await auth.verifyIdToken(token);
    } catch {
      return NextResponse.json({ success: false, error: "Invalid token" }, { status: 401 });
    }

    const body = await request.json();
    const {
      customerName,
      customerEmail,
      phone,
      address,
      items,
      subtotal,
      deliveryFee,
      total,
      paymentMethod,
      bkashTransactionId,
      promoCode,
      discountAmount,
    } = body;

    // Basic validation
    if (!customerName || !phone || !address || !items?.length) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    if (!["cash_on_delivery", "bkash_mock"].includes(paymentMethod as string)) {
      return NextResponse.json(
        { success: false, error: "Invalid payment method" },
        { status: 400 }
      );
    }

    const db = getFirestoreDb();
    const now = new Date();

    // Handle Promo Code Usage
    if (promoCode) {
      const promoRef = db.collection("promo_codes").where("code", "==", String(promoCode).toUpperCase().trim()).limit(1);
      const promoSnap = await promoRef.get();
      if (!promoSnap.empty) {
        const promoDoc = promoSnap.docs[0];
        // Increment usageCount atomically
        await promoDoc.ref.update({
          usageCount: (promoDoc.data().usageCount || 0) + 1,
          updatedAt: now
        });
      }
    }

    const orderData = {
      userId: decodedToken.uid,
      customerEmail: customerEmail || decodedToken.email || "",
      customerName: String(customerName).trim(),
      phone: String(phone).trim(),
      address: String(address).trim(),
      items,
      subtotal: Number(subtotal) || 0,
      deliveryFee: Number(deliveryFee) || 0,
      promoCode: promoCode ? String(promoCode).toUpperCase().trim() : undefined,
      discountAmount: Number(discountAmount) || 0,
      total: Number(total) || 0,
      paymentMethod: paymentMethod as PaymentMethod,
      status: "pending" as OrderStatus,
      ...(bkashTransactionId ? { bkashTransactionId: String(bkashTransactionId).trim() } : {}),
      createdAt: now,
      updatedAt: now,
    };

    const docRef = await db.collection("orders").add(orderData);

    // Send confirmation email via Resend if configured
    if (resend && orderData.customerEmail) {
      try {
        await resend.emails.send({
          from: process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev",
          to: orderData.customerEmail,
          subject: `Order Confirmation #${docRef.id} - Bismillah Accessories`,
          html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; background-color: #fafaf8; padding: 20px; border-radius: 8px;">
              <h1 style="color: #2f9e74;">Thank you for your order!</h1>
              <p>Hi ${orderData.customerName},</p>
              <p>We've received your order <strong>#${docRef.id}</strong> and are getting it ready.</p>
              
              <h3>Order Summary:</h3>
              <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
                ${orderData.items.map((item: any) => `
                  <tr>
                    <td style="padding: 8px; border-bottom: 1px solid #ddd;">${item.name} x${item.quantity}</td>
                    <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: right;">৳${(item.price * item.quantity).toLocaleString("en-BD")}</td>
                  </tr>
                `).join("")}
                <tr>
                  <td style="padding: 8px; font-weight: bold; border-top: 2px solid #ccc;">Subtotal</td>
                  <td style="padding: 8px; font-weight: bold; text-align: right; border-top: 2px solid #ccc;">৳${orderData.subtotal.toLocaleString("en-BD")}</td>
                </tr>
                <tr>
                  <td style="padding: 8px; font-weight: bold;">Delivery Fee</td>
                  <td style="padding: 8px; font-weight: bold; text-align: right;">৳${orderData.deliveryFee.toLocaleString("en-BD")}</td>
                </tr>
                ${orderData.discountAmount > 0 ? `
                <tr>
                  <td style="padding: 8px; font-weight: bold; color: #d65f5f;">Discount (${orderData.promoCode})</td>
                  <td style="padding: 8px; font-weight: bold; text-align: right; color: #d65f5f;">-৳${orderData.discountAmount.toLocaleString("en-BD")}</td>
                </tr>
                ` : ""}
                <tr>
                  <td style="padding: 8px; font-weight: bold; font-size: 1.2em;">Total Paid</td>
                  <td style="padding: 8px; font-weight: bold; font-size: 1.2em; text-align: right; color: #2f9e74;">৳${orderData.total.toLocaleString("en-BD")}</td>
                </tr>
              </table>
              
              <div style="margin-top: 20px; background-color: #f6f4ee; padding: 15px; border-radius: 8px;">
                <p style="margin: 0; color: #171717;">
                  <strong>Delivery to:</strong><br/>
                  ${orderData.address}<br/>
                  ${orderData.phone}
                </p>
              </div>
              
              <p style="margin-top: 30px; font-size: 0.9em; color: #666;">
                If you have any questions about your order, reply to this email or contact our support team.
              </p>
              <p style="margin-top: 10px; font-size: 0.8em; color: #999;">
                &copy; ${new Date().getFullYear()} Bismillah Accessories
              </p>
            </div>
          `,
        });
        console.log(`[POST /api/orders] Confirmation email sent to ${orderData.customerEmail}`);
      } catch (emailError) {
        console.error("[POST /api/orders] Failed to send email via Resend:", emailError);
        // Note: we do not throw an error here, so the order creation still succeeds
      }
    } else {
      console.log(`[POST /api/orders] Email notification skipped (no RESEND_API_KEY or missing email). Email would have been: ${orderData.customerEmail}`);
    }

    return NextResponse.json({ success: true, orderId: docRef.id });
  } catch (error) {
    console.error("[POST /api/orders]", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to create order",
      },
      { status: 500 }
    );
  }
}

// GET /api/orders — admin: list all orders
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.slice(7);
    await verifyAdminIdToken(token); // throws if not admin

    const db = getFirestoreDb();
    const snapshot = await db
      .collection("orders")
      .orderBy("createdAt", "desc")
      .limit(200)
      .get();

    const orders = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      // Convert Firestore Timestamps to ISO strings for JSON serialisation
      createdAt: doc.data().createdAt?.toDate?.()?.toISOString?.() ?? doc.data().createdAt,
      updatedAt: doc.data().updatedAt?.toDate?.()?.toISOString?.() ?? doc.data().updatedAt,
    }));

    return NextResponse.json({ success: true, data: orders });
  } catch (error) {
    console.error("[GET /api/orders]", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to fetch orders",
      },
      { status: 500 }
    );
  }
}
