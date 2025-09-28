export interface Neo4jModuleOptions {
  uri: string;
  user: string;
  password: string;
  database?: string;
  encryption?: "on" | "off";
  poolMaxSize?: number;
}
