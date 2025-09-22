import { sql } from "drizzle-orm";
import {
  mysqlTable,
  varchar,
  datetime,
  json,
  binary,
} from "drizzle-orm/mysql-core";
import { users } from "./users";
export const consents = mysqlTable("consents", {
  id: binary("id", { length: 16 }).primaryKey(),
  userId: binary("user_id", { length: 16 })
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
