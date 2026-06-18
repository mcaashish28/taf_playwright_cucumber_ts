import { Before, After, BeforeAll, AfterAll, Status, setDefaultTimeout } from "@cucumber/cucumber";
import { chromium, firefox, webkit, Browser, LaunchOptions } from "@playwright/test";
import { ICustomWorld } from "./custom-world";
import { spawn } from "child_process";
import * as fs from "fs";
import * as path from "path";

// Safe import of csvToMap (csv-parse must be installed)
let csvToMap: (() => Promise<Map<string, string>>) | undefined;
try {
  csvToMap = require("../utils/excel.helper").csvToMap;
} catch (_) { /* excel.helper or csv-parse not available */ }

// --- Config: reads from ./config.ts if available, otherwise falls back to env vars ---
let BASE_URL = process.env.BASE_URL || "";
let browserName = (process.env.BROWSER as "chromium" | "firefox" | "webkit") || "chromium";
let browserOptions: LaunchOptions = {
  headless: process.env.HEADLESS === "false",
  slowMo: parseInt(process.env.SLOW_MO ||"200"),
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
  this.feature = scenario.pickle;
  console.log(`Starting scenario: ${this.testName}`);

  // Load CSV test data map
  if (csvToMap) {
    try {
      this.global_data_map = await csvToMap();
    } catch (e) {
      console.log("Warning: Could not load CSV test data:", String(e));
    }
  }

  this.context = await browser.newContext({
    viewport: null,
  });
  this.page = await this.context.newPage();
  this.page.setDefaultTimeout(TIMEOUT);

  // Create second context for multi-app scenarios (e.g., WelSync)
  this.context1 = await browser.newContext({
    viewport: null,
  });

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
  if (this.page1) {
    await this.page1.close();
  }
  if (this.context) {
    await this.context.close();
  }
  if (this.context1) {
    await this.context1.close();
  }
});

AfterAll(async function () {
  console.log("Closing browser...");
  if (browser) {
    await browser.close();
  }

  // Give the JSON formatter a moment to flush, then generate HTML report
  try {
    await new Promise((resolve) => setTimeout(resolve, 5000));

    const reportsDir = path.resolve(process.cwd(), "reports");
    if (!fs.existsSync(reportsDir)) fs.mkdirSync(reportsDir, { recursive: true });

    // Clean up stale lock file (older than 30 seconds)
    const lockFile = path.join(reportsDir, ".report_lock");
    try {
      if (fs.existsSync(lockFile)) {
        const lockAge = Date.now() - fs.statSync(lockFile).mtimeMs;
        if (lockAge > 30 * 1000) {
          fs.unlinkSync(lockFile);
          console.log("Removed stale report lock file.");
        }
      }
    } catch (_) { /* ignore */ }

    try {
      const fd = fs.openSync(lockFile, "wx");
      fs.closeSync(fd);

      try {
        const child = spawn("npx", ["ts-node", "src/support/reporters/custom-reporter.ts"], {
          detached: true,
          stdio: ["ignore", "pipe", "pipe"],
          cwd: process.cwd(),
          env: { ...process.env, REPORT_LOCK_FILE: lockFile, REPORT_GENERATOR_DELAY_MS: "5000" },
        });

        // Log output so errors are visible
        child.stdout?.on("data", (data: Buffer) => process.stdout.write(data));
        child.stderr?.on("data", (data: Buffer) => process.stderr.write(data));
        child.on("error", (err) => console.error("Report generator error:", err.message));
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
