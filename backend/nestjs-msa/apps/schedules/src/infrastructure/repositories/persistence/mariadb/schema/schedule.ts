import {
  mysqlTable,
  varchar,
  datetime,
  json,
  date,
} from "drizzle-orm/mysql-core";
import { users } from "apps/users/src/infrastructure/repositories/persistence/mariadb/schema/users";
import { sql } from "drizzle-orm";

export const schedules = mysqlTable("schedules", {
  id: varchar("id", { length: 36 }).primaryKey(),
  userId: varchar("user_id", { length: 36 })
    .notNull()
    .references(() => users.id),
  externalEventId: varchar("external_event_id", { length: 1000 }),
  source: varchar("source", { length: 1000 }),
  title: varchar("title", { length: 200 }),
  date: date("date"),
  startTs: datetime("start_ts"),
  endTs: datetime("end_ts"),
  status: varchar("status", { length: 50 }),
  location: varchar("location", { length: 500 }),
  attendees: json("attendees"),
  createdAt: datetime("created_at")
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  updatedAt: datetime("updated_at")
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
});
