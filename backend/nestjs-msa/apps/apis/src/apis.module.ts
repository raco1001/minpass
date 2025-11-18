import { resolve } from "path";

import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";

import { PresentationModule } from "./presentation/presentation.module";
import { ApisService } from "./services/health.check";
import { InfrastructureModule } from "@apis/infrastructure/infrastructure.module";
import { ServiceModule } from "@apis/services/service.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      expandVariables: true,
      envFilePath: [
        // APIs 서비스 전용 환경 변수 (우선순위 높음)
        resolve(process.cwd(), "apps/apis/.env.local"),
        resolve(process.cwd(), "apps/apis/.env"),
        // 공통 환경 변수 (fallback)
        resolve(process.cwd(), ".env.local"),
        resolve(process.cwd(), ".env"),
        // 폴백: 빌드된 dist 디렉토리에서 실행될 경우
        resolve(__dirname, "../../../apps/apis/.env.local"),
        resolve(__dirname, "../../../apps/apis/.env"),
        resolve(__dirname, "../../../.env.local"),
        resolve(__dirname, "../../../.env"),
      ],
    }),
    PresentationModule,
    InfrastructureModule,
    ServiceModule,
  ],
  controllers: [],
  providers: [ApisService],
})
export class ApisModule {}
