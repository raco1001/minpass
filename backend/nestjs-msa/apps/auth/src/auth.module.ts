import { Module } from "@nestjs/common";
import { resolve } from "path";

import { AuthController } from "./presentation/web/controllers/auth.controller";
import { ConfigModule } from "@nestjs/config";
import { ServiceModule } from "./services/service.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      expandVariables: true,
      envFilePath: [
        // Auth 서비스 전용 환경 변수 (우선순위 높음)
        resolve(process.cwd(), "apps/auth/.env.local"),
        resolve(process.cwd(), "apps/auth/.env"),
        // 공통 환경 변수 (fallback)
        resolve(process.cwd(), ".env.local"),
        resolve(process.cwd(), ".env"),
        // 폴백: 빌드된 dist 디렉토리에서 실행될 경우
        resolve(__dirname, "../../../apps/auth/.env.local"),
        resolve(__dirname, "../../../apps/auth/.env"),
        resolve(__dirname, "../../../.env.local"),
        resolve(__dirname, "../../../.env"),
      ],
    }),
    ServiceModule,
  ],
  controllers: [AuthController],
})
export class AuthModule {}
