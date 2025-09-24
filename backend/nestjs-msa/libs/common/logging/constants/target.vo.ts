import type { Targets } from "../types/target.types";

export const targetVos: Targets = [
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
];
