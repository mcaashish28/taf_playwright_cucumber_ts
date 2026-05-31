import { Before, After, BeforeAll, AfterAll, Status, setDefaultTimeout } from "@cucumber/cucumber";
import { chromium, firefox, webkit, Browser, LaunchOptions } from "@playwright/test";
import { ICustomWorld } from "./custom-world";
import { spawn } from "child_process";
import * as fs from "fs";
import * as path from "path";

// --- Config: reads from ./config.ts if available, otherwise falls back to env vars ---
let BASE_URL = process.env.BASE_URL || "";
let browserName = (process.env.BROWSER as "chromium" | "firefox" | "webkit") || "chromium";
let browserOptions: LaunchOptions = {
  headless: process.env.HEADLESS === "true",
  slowMo: parseInt(process.env.SLOW_MO || "0"),
  args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage", "--start-maximized"],
};

try {
  const { config, currentEnv, getBaseUrl } = require("./config");
  if (getBaseUrl) {
    BASE_URL = BASE_URL || getBaseUrl();
  } else if (config?.ENVIORNMENT) {
    const env = currentEnv || process.env.ENV || "QA";
    BASE_URL = BASE_URL || config.ENVIORNMENT[env]?.BASE_URL || "";
  }
  if (config?.browser) browserName = config.browser;
  if (config?.browserOptions) browserOptions = { ...browserOptions, ...config.browserOptions };
} catch (_) { /* no config file - using env vars */ }

const TIMEOUT = parseInt(process.env.TIMEOUT || "30000");

setDefaultTimeout(60000);

let browser: Browser;

BeforeAll(async function () {
  console.log("Launching browser...");
  switch (browserName) {
    case "firefox":
      browser = await firefox.launch(browserOptions);
      break;
    case "webkit":
      browser = await webkit.launch(browserOptions);
      break;
    default:
      browser = await chromium.launch(browserOptions);
  }
});

Before(async function (this: ICustomWorld, scenario) {
  this.startTime = new Date();
  this.testName = scenario.pickle.name;
  console.log(`Starting scenario: ${this.testName}`);

  this.context = await browser.newContext({
    viewport: null,
  });
  this.page = await this.context.newPage();
  this.page.setDefaultTimeout(TIMEOUT);
  if (BASE_URL) {
    await this.page.goto(BASE_URL);
  }
});

After(async function (this: ICustomWorld, scenario) {
  console.log(`Finished scenario: ${this.testName} - Status: ${scenario.result?.status}`);

  if (scenario.result?.status === Status.FAILED) {
    if (this.page) {
      const screenshot = await this.page.screenshot({
        path: `screenshots/${this.testName}-${Date.now()}.png`,
        fullPage: true,
      });
      this.attach(screenshot, "image/png");
    }
  }

  if (this.page) {
    await this.page.close();
  }
  if (this.context) {
    await this.context.close();
  }
});

AfterAll(async function () {
  console.log("Closing browser...");
  if (browser) {
    await browser.close();
  }

  // Give the JSON formatter a moment to flush, then spawn detached HTML generator
  try {
    await new Promise((resolve) => setTimeout(resolve, 5000));

    const reportsDir = path.resolve(process.cwd(), "reports");
    const lockFile = path.join(reportsDir, ".report_lock");
    try {
      const fd = fs.openSync(lockFile, "wx");
      fs.closeSync(fd);

      try {
        const child = spawn("npx", ["ts-node", "src/support/reporters/custom-reporter.ts"], {
          detached: true,
          stdio: "ignore",
          cwd: process.cwd(),
          env: { ...process.env, REPORT_LOCK_FILE: lockFile, REPORT_GENERATOR_DELAY_MS: "5000" },
        });
        child.unref();
        console.log("Scheduled detached report generator.");
      } catch (spawnErr) {
        try { fs.unlinkSync(lockFile); } catch (_) { /* ignore */ }
        console.error("Failed to spawn detached report generator:", String(spawnErr));
      }
    } catch (e) {
      console.log("Report generation already scheduled by another worker (lock present).");
    }
  } catch (err) {
    console.error("Error scheduling HTML report generation in AfterAll:", err);
  }
});
