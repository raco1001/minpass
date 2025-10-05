export const MARIADB_OPTIONS = (name = "default") => `MARIADB_OPTIONS__${name}`;
export const MARIADB_POOL = (name = "default") => `MARIADB_POOL__${name}`;
export const DRIZZLE_DB = (name = "default") => `DRIZZLE_DB__${name}`;
export const MARIADB_POOL_SHUTDOWN = (name = "default") =>
  `MARIADB_POOL_SHUTDOWN__${name}`;
