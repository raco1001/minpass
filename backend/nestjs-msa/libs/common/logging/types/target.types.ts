export type TargetName =
  | "pino/file"
  | "pino/console"
  | "pino-pretty"
  | "pino/http";

export type TargetOptions = {
  destination?: string;
  translateTime?: string;
  colorize?: boolean;
  ignore?: string[];
  redact?: string[];
  level?: Level;
  formatters?: Record<string, (...args: any[]) => any>;
  serializers?: Record<string, (...args: any[]) => any>;
  filters?: Record<string, (...args: any[]) => any>;
  hooks?: Record<string, (...args: any[]) => any>;
  hooksAsync?: Record<string, (...args: any[]) => any>;
  hooksAsyncAsync?: Record<string, (...args: any[]) => any>;
  hooksAsyncAsyncAsync?: Record<string, (...args: any[]) => any>;
};

export type Level = "fatal" | "error" | "warn" | "info" | "debug" | "trace";

export type Target = {
  target: TargetName;
  options?: TargetOptions;
  level: Level;
};

export type Targets = Target[];
