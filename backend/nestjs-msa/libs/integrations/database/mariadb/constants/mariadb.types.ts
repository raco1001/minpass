import type { MySql2Database } from "drizzle-orm/mysql2";

export interface MariaDbOptions {
  host: string;
  port?: number;
  user: string;
  password: string;
  database: string;
  connectionLimit?: number;
  schema?: Record<string, unknown>;
  name?: string;
}

export type DrizzleDb = MySql2Database<any>;
