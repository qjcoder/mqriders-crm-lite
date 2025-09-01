import { db } from "../db";
import {
  products,
  purchaseItems,
  purchases,
  saleItems,
  sales,
} from "../db/schema";
import { eq } from "drizzle-orm";

const uid = () =>
  Math.random().toString(36).slice(2) + "-" + Date.now().toString(36);

/** Record a purchase (increases stock & recalculates average cost) */
export async function recordPurchase(
  vendorId: string,
  dateISO: string,
  lines: Array<{ productId: string; qty: number; unitCost: number }>,
  notes?: string
) {
  const purchaseId = uid();
  await db
    .insert(purchases)
    .values({ id: purchaseId, vendorId, date: dateISO, notes });

  for (const l of lines) {
    await db.insert(purchaseItems).values({ id: uid(), purchaseId, ...l });

    // fetch current product
    const [p] = await db
      .select()
      .from(products)
      .where(eq(products.id, l.productId));
    const oldStock = p?.stockQty ?? 0;
    const oldAvg = p?.avgCost ?? 0;

    const newStock = oldStock + l.qty;
    const newAvg =
      newStock > 0 ? (oldAvg * oldStock + l.unitCost * l.qty) / newStock : 0;

    await db
      .update(products)
      .set({ stockQty: newStock, avgCost: newAvg })
      .where(eq(products.id, l.productId));
  }

  return purchaseId;
}

/** Record a sale (decreases stock, captures costAtSale for profit calc) */
export async function recordSale(
  customerId: string,
  dateISO: string,
  lines: Array<{ productId: string; qty: number; unitPrice: number }>,
  notes?: string
) {
  const saleId = uid();
  await db
    .insert(sales)
    .values({ id: saleId, customerId, date: dateISO, notes });

  for (const l of lines) {
    const [p] = await db
      .select()
      .from(products)
      .where(eq(products.id, l.productId));
    const avgCost = p?.avgCost ?? 0;
    const newStock = Math.max(0, (p?.stockQty ?? 0) - l.qty);

    await db.insert(saleItems).values({
      id: uid(),
      saleId,
      productId: l.productId,
      qty: l.qty,
      unitPrice: l.unitPrice,
      costAtSale: avgCost,
    });

    await db
      .update(products)
      .set({ stockQty: newStock })
      .where(eq(products.id, l.productId));
  }

  return saleId;
}
