import { Module } from "@nestjs/common";

import { AuthController } from "./presentation/web/controllers/auth.controller";
import { AuthService } from "./services/auth.service";
import { ConfigModule } from "@nestjs/config";
import { InfrastructureModule } from "./infrastructure/infrastructure.module";
import { IAuthServicePort } from "./core/ports/in/auth-service.port";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    InfrastructureModule,
  ],
  controllers: [AuthController],
  providers: [{ provide: IAuthServicePort, useClass: AuthService }],
  exports: [IAuthServicePort],
})
export class AuthModule {}
