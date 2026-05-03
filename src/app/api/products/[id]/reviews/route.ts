import { NextRequest, NextResponse } from "next/server";
import { getFirestoreDb } from "@/lib/firebase/admin";
import { getFirebaseAuth } from "@/lib/firebase/server-auth";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  let productId = "";
  try {
    const resolvedParams = await params;
    productId = resolvedParams.id;
    
    const db = getFirestoreDb();
    const snapshot = await db
      .collection("products")
      .doc(productId)
      .collection("reviews")
      .orderBy("createdAt", "desc")
      .get();

    const reviews = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate?.()?.toISOString?.() ?? doc.data().createdAt,
    }));

    return NextResponse.json({ success: true, data: reviews });
  } catch (error) {
    console.error(`[GET /api/products/${productId}/reviews]`, error);
    return NextResponse.json({ success: false, error: "Failed to fetch reviews" }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  let productId = "";
  try {
    const resolvedParams = await params;
    productId = resolvedParams.id;
    
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
    const { rating, comment, userName } = body;

    if (!rating || rating < 1 || rating > 5) {
      return NextResponse.json({ success: false, error: "Invalid rating" }, { status: 400 });
    }

    const db = getFirestoreDb();
    
    // Check if user already reviewed
    const existingReviews = await db
      .collection("products")
      .doc(productId)
      .collection("reviews")
      .where("userId", "==", decodedToken.uid)
      .get();
      
    if (!existingReviews.empty) {
      return NextResponse.json({ success: false, error: "You have already reviewed this product." }, { status: 400 });
    }

    const reviewData = {
      productId,
      userId: decodedToken.uid,
      userName: userName || decodedToken.name || decodedToken.email?.split("@")[0] || "Anonymous",
      rating: Number(rating),
      comment: String(comment || "").trim(),
      createdAt: new Date(),
    };

    // Use a transaction to update product aggregates and add review
    await db.runTransaction(async (transaction) => {
      const productRef = db.collection("products").doc(productId);
      const productDoc = await transaction.get(productRef);
      
      if (!productDoc.exists) {
        throw new Error("Product not found");
      }
      
      const productData = productDoc.data()!;
      const currentCount = productData.reviewCount || 0;
      const currentAvg = productData.averageRating || 0;
      
      const newCount = currentCount + 1;
      const newAvg = ((currentAvg * currentCount) + reviewData.rating) / newCount;
      
      const reviewRef = productRef.collection("reviews").doc();
      transaction.set(reviewRef, reviewData);
      transaction.update(productRef, {
        reviewCount: newCount,
        averageRating: newAvg
      });
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(`[POST /api/products/${productId}/reviews]`, error);
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : "Failed to submit review" 
    }, { status: 500 });
  }
}
