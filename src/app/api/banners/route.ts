import { NextResponse } from "next/server";
import { getFirestoreDb } from "@/lib/firebase/admin";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const db = getFirestoreDb();
    // Fetch all banners and filter/sort in memory to avoid composite index requirements
    const snapshot = await db.collection("banners").get();
    
    const banners = snapshot.docs
      .map(doc => ({
        id: doc.id,
        ...doc.data()
      }) as any)
      .filter(banner => banner.isActive === true)
      .sort((a, b) => (a.order || 0) - (b.order || 0));

    return NextResponse.json({ data: banners });
  } catch (error) {
    console.error("Public fetch banners error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
