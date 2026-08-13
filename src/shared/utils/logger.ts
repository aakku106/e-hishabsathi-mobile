import { ENV } from "@/config/env";

type LogLevel = "debug" | "info" | "warn" | "error";

const LEVEL_PRIORITY: Record<LogLevel, number> = {
  debug: 10,
  info: 20,
  warn: 30,
  error: 40,
};

function log(level: LogLevel, message: string, ...args: unknown[]): void {
  if (!ENV.isDev) return;

  const prefix = `[e-hishab] ${level.toUpperCase()}`;
  const consoleFn =
    level === "debug" ? console.debug
    : level === "info" ? console.info
    : level === "warn" ? console.warn
    : console.error;

  if (LEVEL_PRIORITY[level] >= LEVEL_PRIORITY.warn) {
    consoleFn(prefix, message, ...args);
  } else if (args.length > 0) {
    consoleFn(prefix, message, args);
  } else {
    consoleFn(prefix, message);
  }
}

export const logger = {
  debug: (message: string, ...args: unknown[]) => log("debug", message, ...args),
  info: (message: string, ...args: unknown[]) => log("info", message, ...args),
  warn: (message: string, ...args: unknown[]) => log("warn", message, ...args),
  error: (message: string, ...args: unknown[]) => log("error", message, ...args),
};
