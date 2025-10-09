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
        resolve(__dirname, ".env.local"),
        resolve(__dirname, ".env"),
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
