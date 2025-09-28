export type LoggerMode = "http" | "grpc";

export interface CommonLoggerOptions {
  mode: LoggerMode;
  serviceName: string;
  level?: string;
  logDir?: string;
  enableStdout?: boolean;
  sampling?: { debug?: number; trace?: number };
  redactPaths?: string[];
  env?: string;
}

export const LOGGER_OPTIONS = "COMMON_LOGGER_OPTIONS";
