import { Provider } from "@nestjs/common";
import { createPool } from "mysql2/promise";
import { drizzle } from "drizzle-orm/mysql2";
import {
  DRIZZLE_DB,
  MARIADB_OPTIONS,
  MARIADB_POOL,
} from "./constants/mariadb.constants";
import { MariaDbOptions } from "./constants/mariadb.types";

export function createMariaDbProviders(name = "default"): Provider[] {
  return [
    {
      provide: MARIADB_POOL(name),
      inject: [MARIADB_OPTIONS(name)],
      useFactory: (opts: MariaDbOptions) => {
        const pool = createPool({
          host: opts.host,
          port: opts.port ?? 3307,
          user: opts.user,
          password: opts.password,
          database: opts.database,
          waitForConnections: true,
          connectionLimit: opts.connectionLimit ?? 10,
          queueLimit: 0,
        });
        return pool;
      },
    },
    {
      provide: DRIZZLE_DB(name),
      inject: [MARIADB_POOL(name), MARIADB_OPTIONS(name)],
      useFactory: (
        pool: ReturnType<typeof createPool>,
        opts: MariaDbOptions,
      ) => {
        return opts.schema
          ? drizzle(pool, { schema: opts.schema, mode: "default" })
          : drizzle(pool);
      },
    },
  ];
}
