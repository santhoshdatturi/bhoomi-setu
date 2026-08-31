import pino from "pino";

/**
 * Base pino instance configured for server-side use.
 *
 * In development, logs are pretty-printed via pino's built-in formatters.
 * In production, logs are structured JSON for ingestion by log aggregators.
 */
const baseLogger = pino({
  level: process.env.LOG_LEVEL ?? (process.env.NODE_ENV === "production" ? "info" : "debug"),
  timestamp: pino.stdTimeFunctions.isoTime,
  redact: {
    paths: [
      "password",
      "currentPassword",
      "newPassword",
      "confirmPassword",
      "*.password",
      "*.currentPassword",
      "*.newPassword",
      "*.confirmPassword",
      "*.*.password",
      "*.*.currentPassword",
      "*.*.newPassword",
      "*.*.confirmPassword",
    ],
    censor: "[REDACTED]",
  },
  serializers: {
    err: pino.stdSerializers.err,
  },
  formatters: {
    level(label) {
      return { level: label };
    },
  },
  // In dev, use a human-readable format
  ...(process.env.NODE_ENV !== "production" && {
    transport: {
      target: "pino/file",
      options: { destination: 1 }, // stdout
    },
  }),
});

/**
 * Create a child logger scoped to a specific namespace (service, action layer, etc.).
 *
 * @example
 * ```ts
 * const log = createLogger("users.service");
 * log.info("User created", { userId: "abc" });
 * log.error({ err, userId }, "Failed to create user");
 * ```
 */
export function createLogger(namespace: string) {
  return baseLogger.child({ ns: namespace });
}

export type Logger = ReturnType<typeof createLogger>;
