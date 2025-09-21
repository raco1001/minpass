import { Global, Module, OnModuleDestroy } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import neo4j, { Driver, auth } from "neo4j-driver";
import { NEO4J_DRIVER, NEO4J_CONFIG } from "./constants/neo4j.constants";
import neo4jConfig from "./config/neo4j.config";
import { Neo4jModuleOptions } from "./constants/neo4j.types";
import { Neo4jService } from "./neo4j.service";

@Global()
@Module({
  imports: [ConfigModule.forFeature(neo4jConfig)],
  providers: [
    {
      provide: NEO4J_CONFIG,
      useFactory: (cfg: ConfigService) => cfg.get<Neo4jModuleOptions>("neo4j")!,
      inject: [ConfigService],
    },
    {
      provide: NEO4J_DRIVER,
      useFactory: (opts: Neo4jModuleOptions): Driver => {
        const driver = neo4j.driver(
          opts.uri,
          auth.basic(opts.user, opts.password),
          {
            maxConnectionPoolSize: opts.poolMaxSize,
          },
        );
        return driver;
      },
      inject: [NEO4J_CONFIG],
    },
    Neo4jService,
  ],
  exports: [Neo4jService, NEO4J_DRIVER],
})
export class Neo4jModule implements OnModuleDestroy {
  constructor(private readonly neo4j: Neo4jService) {}
  async onModuleDestroy() {
    await this.neo4j.close();
  }
}
