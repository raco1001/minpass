import { resolve } from "path";

import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";

import { PresentationModule } from "./presentation/presentation.module";
import { ApisService } from "./services/apis.service";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      expandVariables: true,
      envFilePath: [
        resolve(process.cwd(), ".env.local"),
        resolve(process.cwd(), ".env"),
      ],
    }),
    PresentationModule,
  ],
  controllers: [],
  providers: [ApisService],
})
export class ApisModule {}
