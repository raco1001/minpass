import { Module } from "@nestjs/common";

import { AuthController } from "./presentation/grpc/controllers/auth.controller";
import { AuthService } from "./services/auth.service";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { MariaDbModule } from "@mariadb/mariadb.module";
import { MariaDbOptions } from "@mariadb/constants/mariadb.types";
import { authClients } from "./infrastructure/repositories/persistence/mariadb/schema/auth";
import { authProviders } from "./infrastructure/repositories/persistence/mariadb/schema/auth";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    MariaDbModule.registerAsync(
      "auth",
      (cfg: ConfigService): MariaDbOptions => ({
        name: "auth",
        host: cfg.get<string>("DB_HOST", "127.0.0.1"),
        port: parseInt(cfg.get<string>("DB_PORT", "3307"), 10),
        user: cfg.get<string>("DB_AUTH_SCHEMA_NAME", "svc-auth"),
        password: cfg.get<string>("DB_AUTH_SCHEMA_PASSWORD", "auth"),
        database: cfg.get<string>("DB_NAME", "minpass"),
        connectionLimit: 10,
        schema: { authClients, authProviders },
      }),
      [ConfigService],
      [ConfigModule],
    ),
  ],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
