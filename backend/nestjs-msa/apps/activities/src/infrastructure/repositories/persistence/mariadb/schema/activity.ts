import { mysqlTable, varchar, datetime, json } from "drizzle-orm/mysql-core";
import { users } from "apps/users/src/infrastructure/repositories/persistence/mariadb/schema/users";
import { sql } from "drizzle-orm";

export const activityLogs = mysqlTable("activity_logs", {
  id: varchar("id", { length: 36 }).primaryKey(),
  userId: varchar("user_id", { length: 36 }).references(() => users.id),
  type: varchar("type", { length: 100 }),
  ts: datetime("ts"),
  payload: json("payload"),
  deviceId: varchar("device_id", { length: 100 }),
  createdAt: datetime("created_at")
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
});

export const auditLogs = mysqlTable("audit_logs", {
  id: varchar("id", { length: 36 }).primaryKey(),
  userId: varchar("user_id", { length: 36 }).references(() => users.id),
  action: varchar("action", { length: 100 }),
  targetTable: varchar("target_table", { length: 100 }),
  targetId: varchar("target_id", { length: 36 }),
  createdAt: datetime("created_at")
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  meta: json("meta"),
});
