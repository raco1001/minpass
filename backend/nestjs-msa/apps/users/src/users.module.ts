import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { resolve } from "path";

import { MariaDbOptions } from "@app/integrations/mariadb/constants/mariadb.types";
import { MariaDbModule } from "@app/integrations/mariadb/mariadb.module";

import { UsersServicePort } from "./core/ports/in/users.service.port";
import { UsersRepositoryPort } from "./core/ports/out/users.repository.port";
import { ConsentsRepositoryPort } from "./core/ports/out/consents.repository.port";
import { ConsentRepository } from "./infrastructure/repositories/persistence/mariadb/consent.repository";
import { consents } from "./infrastructure/repositories/persistence/mariadb/schema/consents";
import { users } from "./infrastructure/repositories/persistence/mariadb/schema/users";
import { UserRepository } from "./infrastructure/repositories/persistence/mariadb/user.repository";
import { UsersController } from "./presentation/web/controllers/users.controller";
import { UsersService } from "./services/users.service";
import { users as usersContract } from "@app/contracts";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      expandVariables: true,
      envFilePath: [
        // Users 서비스 전용 환경 변수 (우선순위 높음)
        resolve(process.cwd(), "apps/users/.env.local"),
        resolve(process.cwd(), "apps/users/.env"),
        // 공통 환경 변수 (fallback)
        resolve(process.cwd(), ".env.local"),
        resolve(process.cwd(), ".env"),
        // 폴백: 빌드된 dist 디렉토리에서 실행될 경우
        resolve(__dirname, "../../../apps/users/.env.local"),
        resolve(__dirname, "../../../apps/users/.env"),
        resolve(__dirname, "../../../.env.local"),
        resolve(__dirname, "../../../.env"),
      ],
    }),

    MariaDbModule.registerAsync(
      "users",
      (cfg: ConfigService): MariaDbOptions => ({
        name: "users",
        host: cfg.get<string>("DB_HOST", "127.0.0.1"),
        port: parseInt(cfg.get<string>("DB_PORT", "3306"), 10),
        user: cfg.get<string>("DB_USER_SCHEMA_NAME", "svc-user"),
        password: cfg.get<string>("DB_USER_SCHEMA_PASSWORD", "user"),
        database: cfg.get<string>("DB_NAME", "minpass"),
        connectionLimit: 10,
        schema: { users, consents },
      }),
      [ConfigService],
      [ConfigModule],
    ),
  ],
  controllers: [UsersController],
  providers: [
    {
      provide: usersContract.protobufPackage,
      useValue: usersContract.protobufPackage,
    },
    { provide: UsersServicePort, useClass: UsersService },
    { provide: UsersRepositoryPort, useClass: UserRepository },
    { provide: ConsentsRepositoryPort, useClass: ConsentRepository },
  ],
  exports: [
    usersContract.protobufPackage,
    UsersServicePort,
    UsersRepositoryPort,
    ConsentsRepositoryPort,
  ],
})
export class UsersModule {}
