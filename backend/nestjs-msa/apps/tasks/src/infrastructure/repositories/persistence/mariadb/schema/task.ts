/* 
CREATE TABLE `tasks` (
	`id`	BINARY(16)	NOT NULL,
	`schedule_id`	BINARY(16)	NULL,
	`external_task_id`	BINARY(16)	NULL,
	`type`	VARCHAR(500)	NULL,
	`focus_minutes`	INT	NULL,
	`estimate_minutes`	INT	NULL,
	`outcome`	VARCHAR(100)	NULL,
	`tags`	JSON	NULL,
	`created_at`	TIMESTAMP	DEFAULT NOW(),
	`udpated_at`	TIMESTAMP	NULL
);


**/

import { sql } from "drizzle-orm";
import {
  mysqlTable,
  varchar,
  datetime,
  json,
  int,
} from "drizzle-orm/mysql-core";

import { schedules } from "apps/schedules/src/infrastructure/repositories/persistence/mariadb/schema/schedule";

export const tasks = mysqlTable("tasks", {
  id: varchar("id", { length: 36 }).primaryKey(),
  scheduleId: varchar("schedule_id", { length: 36 }).references(
    () => schedules.id,
  ),
  externalTaskId: varchar("external_task_id", { length: 36 }),
  type: varchar("type", { length: 500 }),
  focusMinutes: int("focus_minutes"),
  estimateMinutes: int("estimate_minutes"),
  outcome: varchar("outcome", { length: 100 }),
  tags: json("tags"),
  createdAt: datetime("created_at")
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  updatedAt: datetime("updated_at")
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
});
