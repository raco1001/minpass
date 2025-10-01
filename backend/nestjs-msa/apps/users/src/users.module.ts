import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";

import { MariaDbOptions } from "@mariadb/constants/mariadb.types";
import { MariaDbModule } from "@mariadb/mariadb.module";

import { UsersServicePort } from "./core/ports/in/users.service.port";
import { UsersRepositoryPort } from "./core/ports/out/users.repository.port";
import { ConsentsRepositoryPort } from "./core/ports/out/consents.repository.port";
import { ConsentRepository } from "./infrastructure/repositories/persistence/mariadb/consent.repository";
import { consents } from "./infrastructure/repositories/persistence/mariadb/schema/consents";
import { users } from "./infrastructure/repositories/persistence/mariadb/schema/users";
import { UserRepository } from "./infrastructure/repositories/persistence/mariadb/user.repository";
import { UsersController } from "./presentation/web/controllers/users.controller";
import { UsersService } from "./services/users.service";
import { USERS_V1_PACKAGE_NAME } from "@contracts/generated/users/v1/users";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
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
    { provide: USERS_V1_PACKAGE_NAME, useValue: USERS_V1_PACKAGE_NAME },
    { provide: UsersServicePort, useClass: UsersService },
    { provide: UsersRepositoryPort, useClass: UserRepository },
    { provide: ConsentsRepositoryPort, useClass: ConsentRepository },
  ],
  exports: [
    USERS_V1_PACKAGE_NAME,
    UsersServicePort,
    UsersRepositoryPort,
    ConsentsRepositoryPort,
  ],
})
export class UsersModule {}
