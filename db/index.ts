import * as SQLite from "expo-sqlite";
import { drizzle } from "drizzle-orm/expo-sqlite";
import { migrate } from "drizzle-orm/expo-sqlite/migrator";

export const expo = SQLite.openDatabaseSync("crm.db");
export const db = drizzle(expo);

// run once at app startup
export async function runMigrations() {
  await migrate(db, { migrationsFolder: "drizzle" } as any);
}
