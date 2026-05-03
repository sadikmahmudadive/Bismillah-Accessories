import { getFirestoreDb } from "./firebase/admin";

export type StockLogType = "sale" | "restock" | "manual_adjustment" | "cancellation_refund";

export async function logStockChange(
  productId: string,
  productName: string,
  type: StockLogType,
  changeAmount: number,
  previousStock: number,
  newStock: number,
  orderId?: string,
  adminId?: string
) {
  const db = getFirestoreDb();
  await db.collection("stock_logs").add({
    productId,
    productName,
    type,
    changeAmount,
    previousStock,
    newStock,
    orderId: orderId || null,
    adminId: adminId || null,
    createdAt: new Date(),
  });
}
