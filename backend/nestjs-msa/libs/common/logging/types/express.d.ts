import "express";
import { PinoLogger } from "nestjs-pino";

declare global {
  namespace Express {
    interface Request {
      requestId?: string;
      log: PinoLogger;
    }
  }
}
