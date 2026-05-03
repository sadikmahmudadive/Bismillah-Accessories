import { NextRequest, NextResponse } from "next/server";
import { getFirestoreDb, verifyAdminIdToken } from "@/lib/firebase/admin";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const authHeader = request.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.slice(7);
    await verifyAdminIdToken(token); // Throws if not admin

    const db = getFirestoreDb();
    const reviewRef = db.collection("reviews").doc(id);
    const reviewSnap = await reviewRef.get();

    if (!reviewSnap.exists) {
      return NextResponse.json({ success: false, error: "Review not found" }, { status: 404 });
    }

    const reviewData = reviewSnap.data();
    const productId = reviewData?.productId;

    // Delete the review
    await reviewRef.delete();

    // Recalculate product rating if productId exists
    if (productId) {
      const remainingReviewsSnap = await db.collection("reviews").where("productId", "==", productId).get();
      const remainingReviews = remainingReviewsSnap.docs.map(d => d.data());
      
      const reviewCount = remainingReviews.length;
      const averageRating = reviewCount > 0 
        ? remainingReviews.reduce((acc, curr) => acc + (curr.rating || 0), 0) / reviewCount 
        : 0;

      await db.collection("products").doc(productId).update({
        reviewCount,
        averageRating,
        updatedAt: new Date(),
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[DELETE /api/admin/reviews/:id]", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
