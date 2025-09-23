// logger.config.ts
import { Params } from "nestjs-pino";
import { redaction } from "./constants/redact";
import fs from "fs";
import path from "path";
import { randomUUID } from "crypto";

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
      redact: redaction,
      transport:
        process.env.NODE_ENV === "production"
          ? {
              targets: [
                {
                  target: "pino/file",
                  options: { destination: "./logs/app/app.log" },
                  level: "info",
                },
                {
                  target: "pino/file",
                  options: { destination: "./logs/error/error.log" },
                  level: "error",
                },
                {
                  target: "pino/file",
                  options: { destination: "./logs/warn/warn.log" },
                  level: "warn",
                },
                {
                  target: "pino/file",
                  options: { destination: "./logs/debug/debug.log" },
                  level: "debug",
                },
                {
                  target: "pino/file",
                  options: { destination: "./logs/trace/trace.log" },
                  level: "trace",
                },
              ],
            }
          : {
              target: "pino-pretty",
              options: { translateTime: "SYS:standard", colorize: true },
            },
    },
  };
}
