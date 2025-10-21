import { Module } from "@nestjs/common";

import { AuthController } from "./presentation/web/controllers/auth.controller";
import { ConfigModule } from "@nestjs/config";
import { ServiceModule } from "./services/service.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      expandVariables: true,
    }),
    ServiceModule,
  ],
  controllers: [AuthController],
})
export class AuthModule {}
