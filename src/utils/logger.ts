import * as winston from "winston";

const logger = winston.createLogger({
  level: "info",
  format: winston.format.combine(
    winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    winston.format.printf(({ timestamp, level, message }) => {
      return `[${timestamp}] ${level.toUpperCase()}: ${message}`;
    })
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: "test-results/test.log" }),
  ],
});

export class Logger {
  static info(message: string): void {
    logger.info(message);
  }

  static error(message: string): void {
    logger.error(message);
  }

  static warn(message: string): void {
    logger.warn(message);
  }

  static debug(message: string): void {
    logger.debug(message);
  }
}
