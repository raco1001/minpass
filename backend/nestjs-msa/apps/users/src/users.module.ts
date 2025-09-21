import { Module } from "@nestjs/common";
import { UsersController } from "./presentation/web/controllers/users.controller";
import { UsersService } from "./services/users.service";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { MariaDbModule } from "../../../libs/integrations/database/mariadb/mariadb.module";
import * as UserSchema from "./infrastructure/repositories/persistence/mariadb/schema/user";
@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MariaDbModule.registerAsync(
      "users",
      (cfg: ConfigService) => ({
        name: "users",
        host: cfg.get<string>("DB_HOST")!,
        port: cfg.get<number>("DB_PORT") ?? 3307,
        user: cfg.get<string>("DB_USER_SCHEMA_NAME")!,
        password: cfg.get<string>("DB_USER_SCHEMA_PASSWORD")!,
        database: cfg.get<string>("DB_NAME")!,
        schema: UserSchema,
      }),
      [ConfigService],
      [ConfigModule],
    ),
  ],
  controllers: [UsersController],
  providers: [UsersService],
})
export class UsersModule {}
