import { registerAs } from "@nestjs/config";
import { Neo4jModuleOptions } from "../constants/neo4j.types";

export default registerAs(
  "neo4j",
  (): Neo4jModuleOptions => ({
    uri: process.env.NEO4J_URI!,
    user: process.env.NEO4J_USER!,
    password: process.env.NEO4J_PASSWORD!,
    database: process.env.NEO4J_DATABASE || "neo4j",
    encryption: (process.env.NEO4J_ENCRYPTION as "on" | "off") || "off",
    poolMaxSize: process.env.NEO4J_POOL_MAX_SIZE
      ? Number(process.env.NEO4J_POOL_MAX_SIZE)
      : undefined,
  }),
);
