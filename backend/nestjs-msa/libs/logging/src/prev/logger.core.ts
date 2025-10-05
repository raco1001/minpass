import fs from "fs";
import path from "path";

import type { Params } from "nestjs-pino";

import { defaultRedactPaths } from "./constants/redact";
import { targetVos } from "./constants/target.vo";
import type { CommonLoggerOptions } from "./constants/token";
import type { Targets } from "./types/target.types";

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

  const targets: Targets = [];
  if (logDir) {
    ensureLogDirs(logDir);
    targets.push(...targetVos);
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
          hostname: bindings.hostname,
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
