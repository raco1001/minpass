import { sql } from "drizzle-orm";
import { mysqlTable, varchar, datetime, json } from "drizzle-orm/mysql-core";
import { users } from "./users";
import { uuidv7Binary } from "../../../../../../../../libs/integrations/database/mariadb/util/uuidv7-binary";

export const consents = mysqlTable("consents", {
  id: uuidv7Binary("id", { length: 16 }).primaryKey(),
  userId: uuidv7Binary("user_id", { length: 16 })
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

export type ConsentRow = typeof consents.$inferSelect;
export type NewConsentRow = typeof consents.$inferInsert;
