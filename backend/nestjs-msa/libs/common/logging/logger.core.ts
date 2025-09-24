import type { Params } from "nestjs-pino";
import fs from "fs";
import path from "path";
import { defaultRedactPaths } from "./constants/redact";
import type { CommonLoggerOptions } from "./constants/token";

function ensureLogDirs(base?: string) {
  if (!base) return;
  const dirs = ["app", "error", "warn", "debug", "trace"].map((d) =>
    path.resolve(base, d),
  );
  dirs.forEach((d) => fs.mkdirSync(d, { recursive: true }));
}

export function buildPinoHttpParams(opts: CommonLoggerOptions): Params {
  const {
    serviceName,
    level = process.env.LOG_LEVEL || "info",
    logDir = process.env.LOG_DIR,
    enableStdout = true,
    sampling = { debug: 0, trace: 0 },
    redactPaths = [],
    env = process.env.NODE_ENV || "development",
  } = opts;

  const redact = Array.from(new Set([...defaultRedactPaths, ...redactPaths]));

  const targets: any[] = [];
  if (logDir) {
    ensureLogDirs(logDir);
    targets.push(
      {
        target: "pino/file",
        options: { destination: path.join(logDir, "app/app.log") },
        level: "info",
      },
      {
        target: "pino/file",
        options: { destination: path.join(logDir, "error/error.log") },
        level: "error",
      },
      {
        target: "pino/file",
        options: { destination: path.join(logDir, "warn/warn.log") },
        level: "warn",
      },
      {
        target: "pino/file",
        options: { destination: path.join(logDir, "debug/debug.log") },
        level: "debug",
      },
      {
        target: "pino/file",
        options: { destination: path.join(logDir, "trace/trace.log") },
        level: "trace",
      },
    );
  }

  if (enableStdout) {
    if (env === "production") {
      targets.push({
        target: "pino/console",
        level: "debug",
      });
    } else {
      targets.push({
        target: "pino-pretty",
        options: { translateTime: "SYS:standard", colorize: true },
        level: "debug",
      });
    }
  }
  if (sampling.debug && sampling.debug > 0) {
    targets.push({
      target: "pino/file",
      options: { destination: path.join(logDir ?? "", "debug/debug.log") },
      level: "debug",
    });
  }
  if (sampling.trace && sampling.trace > 0) {
    targets.push({
      target: "pino/file",
      options: { destination: path.join(logDir ?? "", "trace/trace.log") },
      level: "trace",
    });
  }

  return {
    pinoHttp: {
      name: serviceName,
      level,
      redact,
      formatters: {
        level: (label) => ({ level: label }),
        bindings: (bindings: { pid: string; hostname: string }) => ({
          pid: bindings.pid,
          host: bindings.hostname,
          service: serviceName,
          env,
        }),
      },
      ...(targets.length ? { transport: { targets } } : {}),
      customLogLevel: (req, res, err) => {
        if (err) return "error";
        const status = res.statusCode;
        if (status >= 500) return "error";
        if (status >= 400) return "warn";
        return "info";
      },
    },
  };
}
