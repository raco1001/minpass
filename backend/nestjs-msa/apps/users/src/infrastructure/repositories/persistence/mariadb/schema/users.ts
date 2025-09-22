import { sql } from "drizzle-orm";
import { mysqlTable, varchar, datetime, binary } from "drizzle-orm/mysql-core";

export const users = mysqlTable("users", {
  id: binary("id", { length: 16 }).primaryKey(),
  email: varchar("email", { length: 100 }).notNull(),
  displayName: varchar("display_name", { length: 100 }),
  locale: varchar("locale", { length: 50 }).notNull(),
  status: varchar("status", { length: 50 }).notNull(),
  createdAt: datetime("created_at")
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  updatedAt: datetime("updated_at")
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  deletedAt: datetime("deleted_at"),
});

export type UserRow = typeof users.$inferSelect;
export type NewUserRow = typeof users.$inferInsert;
