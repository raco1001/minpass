import { sql } from "drizzle-orm";
import { mysqlTable, varchar, datetime } from "drizzle-orm/mysql-core";

import { uuidv7Binary } from "@mariadb/util/uuidv7-binary";

export const users = mysqlTable("users", {
  id: uuidv7Binary("id", { length: 16 }).primaryKey(),
  email: varchar("email", { length: 100 }).unique().notNull(),
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
