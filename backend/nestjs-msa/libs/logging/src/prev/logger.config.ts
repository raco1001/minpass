// logger.config.ts
import { randomUUID } from "crypto";
import fs from "fs";
import path from "path";

import { Params } from "nestjs-pino";

import { defaultRedactPaths } from "./constants/redact";
import { targetVos } from "./constants/target.vo";
function ensureLogDirs() {
  const dirs = [
    "./logs/app",
    "./logs/error",
    "./logs/warn",
    "./logs/debug",
    "./logs/trace",
  ];
  for (const d of dirs) fs.mkdirSync(path.resolve(d), { recursive: true });
}

export function getPinoHttpOptions(): Params {
  ensureLogDirs();

  return {
    pinoHttp: {
      genReqId: (req, res) => {
        const existingId = req.id ?? req.headers["x-request-id"];
        if (existingId) return existingId;
        const id = randomUUID();
        res.setHeader("x-request-id", id);
        return id;
      },
      level: process.env.LOG_LEVEL || "info",
      redact: defaultRedactPaths,
      transport:
        process.env.NODE_ENV === "production"
          ? {
              targets: targetVos,
            }
          : {
              target: "pino-pretty",
              options: { translateTime: "SYS:standard", colorize: true },
            },
    },
  };
}
