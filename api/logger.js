import pinoMiddleware from "express-pino-logger";
import pino from "pino";

export const logger = pino(
  {
    level: process.env.LOG_LEVEL || "info",
    redact: ["req.headers", "res.headers"],
  }
  // logDestination
);
export const loggingMiddleware = pinoMiddleware({ logger });
