import { sql } from "drizzle-orm";
import { mysqlTable, varchar, datetime, boolean } from "drizzle-orm/mysql-core";
import { users } from "apps/users/src/infrastructure/repositories/persistence/mariadb/schema/users";

export const authClients = mysqlTable("auth_clients", {
  id: varchar("id", { length: 36 }).primaryKey(),
  providerId: varchar("provider_id", { length: 36 })
    .notNull()
    .references(() => authProviders.id),
  userId: varchar("user_id", { length: 36 })
    .notNull()
    .references(() => users.id),
  clientId: varchar("client_id", { length: 100 }),
  salt: varchar("salt", { length: 100 }),
  createdAt: datetime("created_at")
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  updatedAt: datetime("updated_at")
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
});

export const authProviders = mysqlTable("auth_providers", {
  id: varchar("id", { length: 36 }).primaryKey(),
  provider: varchar("provider", { length: 100 }).notNull(),
  imgUrl: varchar("img_url", { length: 1000 }),
  createdAt: datetime("created_at")
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  updatedAt: datetime("updated_at")
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
});

export const authTokens = mysqlTable("auth_tokens", {
  id: varchar("id", { length: 36 }).primaryKey(),
  authClientId: varchar("auth_client_id", { length: 36 })
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
