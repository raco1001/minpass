import { sql } from "drizzle-orm";
import { mysqlTable, varchar, datetime, json } from "drizzle-orm/mysql-core";

import { users } from "apps/users/src/infrastructure/repositories/persistence/mariadb/schema/users";

export const notifications = mysqlTable("notifications", {
  id: varchar("id", { length: 36 }).primaryKey(),
  userId: varchar("user_id", { length: 36 })
    .notNull()
    .references(() => users.id),
  channel: varchar("channel", { length: 100 }),
  templateId: varchar("template_id", { length: 100 }),
  targetTable: varchar("target_table", { length: 100 }),
  targetId: varchar("target_id", { length: 36 }),
  sentAt: datetime("sent_at"),
  status: varchar("status", { length: 100 }),
  meta: json("meta"),
  createdAt: datetime("created_at")
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
});
