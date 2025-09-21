export const pinoOptions = {
  level: process.env.NODE_ENV === "production" ? "info" : "debug",
  transport: {
    targets: [
      {
        target: "pino-pretty",
        options: { colorize: true },
        level: "debug",
      },
      {
        target: "pino/file",
        options: { destination: "./logs/app.log" },
        level: "info",
      },
      {
        target: "pino/file",
        options: { destination: "./logs/error.log" },
        level: "error",
      },
      {
        target: "pino/file",
        options: { destination: "./logs/warn.log" },
        level: "warn",
      },
      {
        target: "pino/file",
        options: { destination: "./logs/debug.log" },
        level: "debug",
      },
      {
        target: "pino/file",
        options: { destination: "./logs/trace.log" },
        level: "trace",
      },
    ],
  },
};
