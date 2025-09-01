import { sqliteTable, integer, real, text } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

const id = () => text().primaryKey().notNull();
const nowDefault = () =>
  text()
    .default(sql`(datetime('now'))`)
    .notNull();

export const products = sqliteTable("products", {
  id: id(),
  sku: text().unique().notNull(),
  name: text().notNull(),
  avgCost: real().notNull().default(0),
  stockQty: integer().notNull().default(0),
  createdAt: nowDefault(),
});

export const vendors = sqliteTable("vendors", {
  id: id(),
  name: text().notNull(),
  phone: text(),
  createdAt: nowDefault(),
});

export const customers = sqliteTable("customers", {
  id: id(),
  name: text().notNull(),
  phone: text(),
  createdAt: nowDefault(),
});

export const purchases = sqliteTable("purchases", {
  id: id(),
  vendorId: text()
    .notNull()
    .references(() => vendors.id),
  date: text().notNull(),
  notes: text(),
  createdAt: nowDefault(),
});

export const purchaseItems = sqliteTable("purchase_items", {
  id: id(),
  purchaseId: text()
    .notNull()
    .references(() => purchases.id),
  productId: text()
    .notNull()
    .references(() => products.id),
  qty: integer().notNull(),
  unitCost: real().notNull(),
});

export const sales = sqliteTable("sales", {
  id: id(),
  customerId: text()
    .notNull()
    .references(() => customers.id),
  date: text().notNull(),
  notes: text(),
  createdAt: nowDefault(),
});

export const saleItems = sqliteTable("sale_items", {
  id: id(),
  saleId: text()
    .notNull()
    .references(() => sales.id),
  productId: text()
    .notNull()
    .references(() => products.id),
  qty: integer().notNull(),
  unitPrice: real().notNull(),
  costAtSale: real().notNull(),
});

export const payments = sqliteTable("payments", {
  id: id(),
  partyType: text({ enum: ["vendor", "customer"] }).notNull(),
  partyId: text().notNull(),
  date: text().notNull(),
  amount: real().notNull(),
  method: text(),
  note: text(),
  createdAt: nowDefault(),
});

export const expenses = sqliteTable("expenses", {
  id: id(),
  date: text().notNull(),
  category: text().notNull(),
  amount: real().notNull(),
  note: text(),
  productId: text(),
  createdAt: nowDefault(),
});
