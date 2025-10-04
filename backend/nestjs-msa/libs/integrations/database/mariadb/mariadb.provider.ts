import { Provider } from "@nestjs/common";
import { drizzle } from "drizzle-orm/mysql2";
import { createPool, Pool } from "mysql2/promise";

import {
  DRIZZLE_DB,
  MARIADB_OPTIONS,
  MARIADB_POOL,
  MARIADB_POOL_SHUTDOWN,
} from "./constants/mariadb.constants";
import { MariaDbOptions } from "./constants/mariadb.types";
import { MariaDbPoolShutdown } from "./mariadb.pool-shutdown";

export function createMariaDbProviders(name = "default"): Provider[] {
  const poolProvider: Provider = {
    provide: MARIADB_POOL(name),
    inject: [MARIADB_OPTIONS(name)],
    useFactory: (opts: MariaDbOptions) => {
      const pool = createPool({
        host: opts.host,
        port: opts.port ?? 3306,
        user: opts.user,
        password: opts.password,
        database: opts.database,
        waitForConnections: true,
        connectionLimit: opts.connectionLimit ?? 10,
        queueLimit: 0, // 이건 돌려보고 알아보자.
      });
      return pool;
    },
  };

  const drizzleProvider: Provider = {
    provide: DRIZZLE_DB(name),
    inject: [MARIADB_POOL(name), MARIADB_OPTIONS(name)],
    useFactory: (pool: Pool, opts: MariaDbOptions) => {
      return opts.schema ? drizzle(pool, opts.schema) : drizzle(pool);
    },
  };

  const shutdownProvider: Provider = {
    provide: MARIADB_POOL_SHUTDOWN
      ? MARIADB_POOL_SHUTDOWN(name)
      : `MARIADB_POOL_SHUTDOWN__${name}`,
    inject: [MARIADB_POOL(name)],
    useFactory: (pool: Pool) => new MariaDbPoolShutdown(pool, name),
  };

  return [poolProvider, drizzleProvider, shutdownProvider];
}
