import * as dotenv from "dotenv";

dotenv.config();

export const ENV = {
  BASE_URL: process.env.BASE_URL || "https://playwright.dev/python",
  ENV_NAME: process.env.ENV_NAME || "qa",
  BROWSER: (process.env.BROWSER as "chromium" | "firefox" | "webkit") || "chromium",
  HEADLESS: process.env.HEADLESS === "true",
  SLOW_MO: parseInt(process.env.SLOW_MO || "0"),
  TIMEOUT: parseInt(process.env.TIMEOUT || "30000"),
  RETRY_COUNT: parseInt(process.env.RETRY_COUNT || "1"),
};
