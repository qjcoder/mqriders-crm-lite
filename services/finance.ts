import { db } from "../db";
import {
  purchases,
  purchaseItems,
  sales,
  saleItems,
  payments,
  expenses,
  products,
} from "../db/schema";
import { and, eq, sql } from "drizzle-orm";

export async function getDashboard() {
  const [stock] = await db
    .select({ qty: sql<number>`SUM(${products.stockQty})` })
    .from(products);
  const [rev] = await db
    .select({ v: sql<number>`SUM(${saleItems.qty} * ${saleItems.unitPrice})` })
    .from(saleItems);
  const [cost] = await db
    .select({ v: sql<number>`SUM(${saleItems.qty} * ${saleItems.costAtSale})` })
    .from(saleItems);
  const [exp] = await db
    .select({ v: sql<number>`SUM(${expenses.amount})` })
    .from(expenses);

  const [salesTotal] = await db
    .select({ v: sql<number>`SUM(${saleItems.qty} * ${saleItems.unitPrice})` })
    .from(saleItems);
  const [custPayments] = await db
    .select({ v: sql<number>`SUM(${payments.amount})` })
    .from(payments)
    .where(eq(payments.partyType, "customer"));
  const receivables = (salesTotal?.v ?? 0) - (custPayments?.v ?? 0);

  const [purchaseTotal] = await db
    .select({
      v: sql<number>`SUM(${purchaseItems.qty} * ${purchaseItems.unitCost})`,
    })
    .from(purchaseItems);
  const [vendPayments] = await db
    .select({ v: sql<number>`SUM(${payments.amount})` })
    .from(payments)
    .where(eq(payments.partyType, "vendor"));
  const payables = (purchaseTotal?.v ?? 0) - (vendPayments?.v ?? 0);

  const profit = (rev?.v ?? 0) - (cost?.v ?? 0) - (exp?.v ?? 0);

  return {
    stockQty: stock?.qty ?? 0,
    soldRevenue: rev?.v ?? 0,
    profit,
    receivables,
    payables,
  };
}

export async function partyBalance(
  partyType: "vendor" | "customer",
  partyId: string
) {
  if (partyType === "vendor") {
    const [due] = await db
      .select({
        v: sql<number>`SUM(${purchaseItems.qty} * ${purchaseItems.unitCost})`,
      })
      .from(purchaseItems)
      .innerJoin(purchases, eq(purchaseItems.purchaseId, purchases.id))
      .where(eq(purchases.vendorId, partyId));

    const [paid] = await db
      .select({ v: sql<number>`SUM(${payments.amount})` })
      .from(payments)
      .where(
        and(eq(payments.partyType, "vendor"), eq(payments.partyId, partyId))
      );

    return (due?.v ?? 0) - (paid?.v ?? 0);
  } else {
    const [due] = await db
      .select({
        v: sql<number>`SUM(${saleItems.qty} * ${saleItems.unitPrice})`,
      })
      .from(saleItems)
      .innerJoin(sales, eq(saleItems.saleId, sales.id))
      .where(eq(sales.customerId, partyId));

    const [paid] = await db
      .select({ v: sql<number>`SUM(${payments.amount})` })
      .from(payments)
      .where(
        and(eq(payments.partyType, "customer"), eq(payments.partyId, partyId))
      );

    return (due?.v ?? 0) - (paid?.v ?? 0);
  }
}
