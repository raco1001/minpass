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
        user: cfg.get<string>("DB_USER_SCHEMA_NAME", "app"),
        password: cfg.get<string>("DB_USER_SCHEMA_PASSWORD", ""),
        database: cfg.get<string>("DB_NAME", "users"),
        connectionLimit: 10,
        schema: { ...userSchema, ...consentSchema },
      }),
      [ConfigService],
      [ConfigModule],
    ),
  ],
  providers: [
    UsersService,
    { provide: IUserRepository, useClass: UserRepository },
    { provide: IConsentRepository, useClass: ConsentRepository },
  ],
  exports: [
    UsersService,
    { provide: IUserRepository, useClass: UserRepository },
    { provide: IConsentRepository, useClass: ConsentRepository },
  ],
})
export class UsersModule {}
