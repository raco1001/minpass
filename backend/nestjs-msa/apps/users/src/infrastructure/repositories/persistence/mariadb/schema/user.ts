import { sql } from "drizzle-orm";
import { mysqlTable, varchar, datetime, json } from "drizzle-orm/mysql-core";
//test
export const users = mysqlTable("users", {
  id: varchar("id", { length: 36 }).primaryKey(),
  email: varchar("email", { length: 100 }).notNull(),
  displayName: varchar("display_name", { length: 100 }).notNull(),
  locale: varchar("locale", { length: 50 }).notNull(),
  status: varchar("status", { length: 50 }).notNull(),
  createdAt: datetime("created_at")
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  updatedAt: datetime("updated_at")
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
});

export const consents = mysqlTable("consents", {
  id: varchar("id", { length: 36 }).primaryKey(),
  userId: varchar("user_id", { length: 36 })
    .notNull()
    .references(() => users.id),
  purpose: varchar("purpose", { length: 100 }),
  scope: json("scope").notNull(),
  grantedAt: datetime("granted_at"),
  revokedAt: datetime("revoked_at"),
  createdAt: datetime("created_at")
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  updatedAt: datetime("updated_at")
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
});
