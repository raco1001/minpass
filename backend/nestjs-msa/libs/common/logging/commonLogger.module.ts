import { Global, Module } from "@nestjs/common";
import { LoggerModule } from "nestjs-pino";
import { getPinoHttpOptions } from "./logger.config";

@Global()
@Module({
  imports: [
    LoggerModule.forRootAsync({
      useFactory: () => getPinoHttpOptions(),
    }),
  ],
  providers: [],
  exports: [],
})
export class CommonLoggerModule {}
