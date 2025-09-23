// apps/users/users.module.ts
import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";

import { MariaDbModule } from "../../../libs/integrations/database/mariadb/mariadb.module";
import { MariaDbOptions } from "../../../libs/integrations/database/mariadb/constants/mariadb.types";

import * as userSchema from "./infrastructure/repositories/persistence/mariadb/schema/users";
import { UsersService } from "./services/users.service";
import { UserRepository } from "./infrastructure/repositories/persistence/mariadb/user.repository";
import { ConsentRepository } from "./infrastructure/repositories/persistence/mariadb/consent.repository";

import * as consentSchema from "./infrastructure/repositories/persistence/mariadb/schema/consents";
import { IUserRepository } from "./core/ports/out/user.repository.port";
import { IConsentRepository } from "./core/ports/out/consent.repository.port";
import { IUserService } from "./core/ports/in/user.service.port";
import { UsersController } from "./presentation/web/controllers/users.controller";

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
        port: parseInt(cfg.get<string>("DB_PORT", "3307"), 10),
        user: cfg.get<string>("DB_USER_SCHEMA_NAME", "svc-user"),
        password: cfg.get<string>("DB_USER_SCHEMA_PASSWORD", "user"),
        database: cfg.get<string>("DB_NAME", "minpass"),
        connectionLimit: 10,
        schema: { ...userSchema, ...consentSchema },
      }),
      [ConfigService],
      [ConfigModule],
    ),
  ],
  controllers: [UsersController],
  providers: [
    { provide: IUserService, useClass: UsersService },
    { provide: IUserRepository, useClass: UserRepository },
    { provide: IConsentRepository, useClass: ConsentRepository },
  ],
  exports: [
    { provide: IUserService, useClass: UsersService },
    { provide: IUserRepository, useClass: UserRepository },
    { provide: IConsentRepository, useClass: ConsentRepository },
  ],
})
export class UsersModule {}
