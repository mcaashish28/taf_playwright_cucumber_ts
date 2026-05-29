import { LaunchOptions } from "@playwright/test";
import { ENV } from "./environment";

export const browserOptions: LaunchOptions = {
  headless: ENV.HEADLESS,
  slowMo: ENV.SLOW_MO,
  args: [
    "--no-sandbox",
    "--disable-setuid-sandbox",
    "--disable-dev-shm-usage",
    "--disable-accelerated-2d-canvas",
    "--disable-gpu",
  ],
};
