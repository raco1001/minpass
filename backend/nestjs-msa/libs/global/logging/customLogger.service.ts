import { Inject, Injectable, LoggerService } from "@nestjs/common";
import { Logger as PinoLogger } from "nestjs-pino";

@Injectable()
export class CustomLoggerService implements LoggerService {
  private readonly logger: PinoLogger;
  constructor(@Inject(PinoLogger) logger: PinoLogger) {
    this.logger = logger;
  }

  log(message: any, context?: string) {
    this.logger.log({ context }, message);
  }

  error(message: any, trace?: string, context?: string) {
    this.logger.error({ context, trace }, message);
  }

  warn(message: any, context?: string) {
    this.logger.warn({ context }, message);
  }

  debug(message: any, context?: string) {
    this.logger.debug({ context }, message);
  }

  verbose(message: any, context?: string) {
    this.logger.verbose({ context }, message);
  }

  logUserAction(userId: string, action: string) {
    this.logger.log({ userId, action }, "User action");
  }
}
