import { NextRequest, NextResponse } from "next/server";
import { getFirestoreDb, verifyAdminIdToken } from "@/lib/firebase/admin";

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.slice(7);
    await verifyAdminIdToken(token); // Throws if not admin

    const db = getFirestoreDb();
    
    // Fetch stats in parallel
    const [ordersSnap, productsSnap, usersSnap, reviewsSnap] = await Promise.all([
      db.collection("orders").get(),
      db.collection("products").get(),
      db.collection("users").get(),
      db.collection("reviews").get(),
    ]);

    const orders = ordersSnap.docs.map(d => d.data());
    const totalRevenue = orders.reduce((acc, curr) => acc + (Number(curr.total) || 0), 0);
    const completedOrders = orders.filter(o => o.status === "delivered").length;
    
    // Recent activity (last 5 orders)
    const recentOrders = ordersSnap.docs
      .map(doc => ({
        id: doc.id,
        customerName: doc.data().customerName,
        total: doc.data().total,
        status: doc.data().status,
        createdAt: doc.data().createdAt?.toDate?.()?.toISOString() ?? doc.data().createdAt,
      }))
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5);

    // Sales by status
    const statusCounts = orders.reduce((acc: any, curr) => {
      acc[curr.status] = (acc[curr.status] || 0) + 1;
      return acc;
    }, {});

    // Low stock products (stock < 10)
    const lowStockProducts = productsSnap.docs
      .map(doc => ({
        id: doc.id,
        name: doc.data().name,
        stock: doc.data().stock,
        category: doc.data().category,
        imageUrl: doc.data().imageUrl,
      }))
      .filter(p => p.stock < 10)
      .sort((a, b) => a.stock - b.stock)
      .slice(0, 10);

    return NextResponse.json({
      success: true,
      data: {
        stats: {
          totalRevenue,
          totalOrders: orders.length,
          completedOrders,
          totalProducts: productsSnap.size,
          totalUsers: usersSnap.size,
          totalReviews: reviewsSnap.size,
          lowStockCount: lowStockProducts.length,
        },
        recentOrders,
        statusCounts,
        lowStockProducts,
      }
    });
  } catch (error) {
    console.error("[GET /api/admin/analytics]", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
