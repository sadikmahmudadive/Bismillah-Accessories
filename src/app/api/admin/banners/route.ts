import { NextResponse } from "next/server";
import { getFirestoreDb } from "@/lib/firebase/admin";
import { verifyAdminIdToken } from "@/lib/firebase/admin";
import { FieldValue } from "firebase-admin/firestore";

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.split(" ")[1];
    await verifyAdminIdToken(token);

    const db = getFirestoreDb();
    const snapshot = await db.collection("banners").orderBy("order", "asc").get();
    
    const banners = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    return NextResponse.json({ data: banners });
  } catch (error) {
    console.error("Fetch banners error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.split(" ")[1];
    await verifyAdminIdToken(token);

    const body = await request.json();
    const db = getFirestoreDb();

    const bannerData = {
      title: body.title,
      subtitle: body.subtitle || "",
      imageUrl: body.imageUrl,
      link: body.link || "",
      buttonText: body.buttonText || "Shop Now",
      isActive: body.isActive !== false,
      order: Number(body.order) || 0,
      createdAt: FieldValue.serverTimestamp(),
    };

    const docRef = await db.collection("banners").add(bannerData);

    return NextResponse.json({ 
      success: true, 
      id: docRef.id 
    });
  } catch (error) {
    console.error("Create banner error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
