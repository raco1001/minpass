import { Module } from "@nestjs/common";

import { AuthController } from "./presentation/web/controllers/auth.controller";
import { LoginService } from "./services/login.service";
import { ConfigModule } from "@nestjs/config";
import { InfrastructureModule } from "./infrastructure/infrastructure.module";
import { LoginServicePort } from "./core/ports/in/login-service.port";
import { validateEnv } from "./infrastructure/auth-provider-client/env.schema";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      expandVariables: true,
      validate: validateEnv,
    }),
    InfrastructureModule,
  ],
  controllers: [AuthController],
  providers: [{ provide: LoginServicePort, useClass: LoginService }],
  exports: [LoginServicePort],
})
export class AuthModule {}
