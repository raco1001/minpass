import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { MariaDbModule } from "@mariadb/mariadb.module";
import { MariaDbOptions } from "@mariadb/constants/mariadb.types";
import { authClients, authProviders, authTokens } from "./schema/auth";
import { MariadbRepository } from "./mariadb.repository";
import { AuthRepositoryPort } from "@src/core/ports/out/auth.repository.port";
@Module({
  imports: [
    MariaDbModule.registerAsync(
      "auth",
      (cfg: ConfigService): MariaDbOptions => ({
        name: "auth",
        host: cfg.get<string>("DB_HOST", "127.0.0.1"),
        port: parseInt(cfg.get<string>("DB_PORT", "3306"), 10),
        user: cfg.get<string>("DB_AUTH_SCHEMA_NAME", "svc-auth"),
        password: cfg.get<string>("DB_AUTH_SCHEMA_PASSWORD", "auth"),
        database: cfg.get<string>("DB_NAME", "minpass"),
        connectionLimit: 10,
        schema: { authClients, authProviders, authTokens },
      }),
      [ConfigService],
      [ConfigModule],
    ),
  ],
  providers: [{ provide: AuthRepositoryPort, useClass: MariadbRepository }],
  exports: [AuthRepositoryPort],
})
export class MariadbRepositoryModule {}
