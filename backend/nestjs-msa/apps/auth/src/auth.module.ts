import { Module } from "@nestjs/common";

import { AuthController } from "./presentation/web/controllers/auth.controller";
import { AuthService } from "./services/auth.service";
import { ConfigModule } from "@nestjs/config";
import { InfrastructureModule } from "./infrastructure/infrastructure.module";
import { AuthServicePort } from "./core/ports/in/auth-service.port";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    InfrastructureModule,
  ],
  controllers: [AuthController],
  providers: [{ provide: AuthServicePort, useClass: AuthService }],
  exports: [AuthServicePort],
})
export class AuthModule {}
