import { Global, Module } from "@nestjs/common";
import { CustomLoggerService } from "./customLogger.service";
import { LoggerModule } from "nestjs-pino";
import { pinoOptions } from "./logger.config";
@Global()
@Module({
  imports: [
    LoggerModule.forRoot({
      pinoHttp: pinoOptions,
    }),
  ],
  providers: [CustomLoggerService],
  exports: [CustomLoggerService],
})
export class CustomLoggerModule {}
