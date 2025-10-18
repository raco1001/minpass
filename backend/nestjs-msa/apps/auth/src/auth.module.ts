import { Module } from "@nestjs/common";

import { AuthController } from "./presentation/web/controllers/auth.controller";
import { ConfigModule } from "@nestjs/config";
import { validateEnv } from "./infrastructure/auth-provider-client/auth-provider-env.schema";
import { ServiceModule } from "./services/service.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      expandVariables: true,
      validate: validateEnv,
    }),
    ServiceModule,
  ],
  controllers: [AuthController],
})
export class AuthModule {}
