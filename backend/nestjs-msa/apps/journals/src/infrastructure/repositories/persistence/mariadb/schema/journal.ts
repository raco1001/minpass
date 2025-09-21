import {
  mysqlTable,
  varchar,
  datetime,
  json,
  int,
  date,
} from "drizzle-orm/mysql-core";
import { users } from "apps/users/src/infrastructure/repositories/persistence/mariadb/schema/user";
import { sql } from "drizzle-orm";

export const bridgeSessions = mysqlTable("bridge_sessions", {
  id: varchar("id", { length: 36 }).primaryKey(),
  userId: varchar("user_id", { length: 36 }).references(() => users.id),
  date: date("date"),
  qna: json("qna"),
  score: int("score"),
  insights: json("insights"),
  createdAt: datetime("created_at")
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  updatedAt: datetime("updated_at")
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
});
