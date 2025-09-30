import { Module } from "@nestjs/common";

import { AuthController } from "./presentation/grpc/controllers/auth.controller";
import { AuthService } from "./services/auth.service";
import { ConfigModule } from "@nestjs/config";
import { InfrastructureModule } from "./infrastructure/infrastructure.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    InfrastructureModule,
  ],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
