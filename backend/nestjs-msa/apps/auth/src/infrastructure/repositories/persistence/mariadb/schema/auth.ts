import { sql } from "drizzle-orm";
import { mysqlTable, varchar, datetime, boolean } from "drizzle-orm/mysql-core";

import { uuidv7Binary } from "@mariadb/util/uuidv7-binary";

export const authClients = mysqlTable("auth_clients", {
  id: uuidv7Binary("id", { length: 16 }).primaryKey(),
  providerId: uuidv7Binary("provider_id", { length: 16 })
    .notNull()
    .references(() => authProviders.id),
  userId: uuidv7Binary("user_id", { length: 16 }).notNull(),
  clientId: varchar("client_id", { length: 100 }).notNull(),
  salt: varchar("salt", { length: 100 }).notNull(),
  createdAt: datetime("created_at")
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  updatedAt: datetime("updated_at")
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
});

export const authProviders = mysqlTable("auth_providers", {
  id: uuidv7Binary("id", { length: 16 }).primaryKey(),
  provider: varchar("provider", { length: 100 }).notNull().unique(),
  imgUrl: varchar("img_url", { length: 1000 }),
  createdAt: datetime("created_at")
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  updatedAt: datetime("updated_at")
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
});

export const authTokens = mysqlTable("auth_tokens", {
  id: uuidv7Binary("id", { length: 16 }).primaryKey(),
  authClientId: uuidv7Binary("auth_client_id", { length: 16 })
    .notNull()
    .references(() => authClients.id),
  providerAccessToken: varchar("provider_access_token", { length: 1000 }),
  providerRefreshToken: varchar("provider_refresh_token", { length: 1000 }),
  refreshToken: varchar("refresh_token", { length: 1000 }),
  revoked: boolean("revoked"),
  expiresAt: datetime("expires_at"),
  createdAt: datetime("created_at")
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  updatedAt: datetime("updated_at")
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
});
