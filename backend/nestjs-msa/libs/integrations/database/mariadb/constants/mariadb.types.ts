import type { MySql2Database } from "drizzle-orm/mysql2";

export interface MariaDbOptions {
  host: string;
  port?: number;
  user: string;
  password: string;
  database: string; // MariaDB: database == schema
  connectionLimit?: number;
  /**
   * 각 서비스 내부에서 export 하는 schema 객체
   * (ex: import * as Schema from './schema')
   */
  schema?: Record<string, unknown>;
  /**
   * 연결 이름(서비스명). 토큰 네임스페이스로 사용
   */
  name?: string; // e.g. 'users', 'auth'
}

export type DrizzleDb = MySql2Database<any>;
