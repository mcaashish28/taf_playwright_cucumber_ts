import { Before, After, BeforeAll, AfterAll, Status, setDefaultTimeout } from "@cucumber/cucumber";
import { chromium, firefox, webkit, Browser, LaunchOptions } from "@playwright/test";
import { ICustomWorld } from "./custom-world";
import { spawn } from "child_process";
import * as fs from "fs";
import * as path from "path";

// --- Inline config (no external file dependencies) ---
const ENV = {
  BASE_URL: process.env.BASE_URL || "",
  BROWSER: (process.env.BROWSER as "chromium" | "firefox" | "webkit") || "chromium",
  HEADLESS: process.env.HEADLESS === "true",
  SLOW_MO: parseInt(process.env.SLOW_MO || "0"),
  TIMEOUT: parseInt(process.env.TIMEOUT || "30000"),
};

const browserOptions: LaunchOptions = {
  headless: ENV.HEADLESS,
  slowMo: ENV.SLOW_MO,
  args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"],
};

setDefaultTimeout(60000);

let browser: Browser;

BeforeAll(async function () {
  console.log("Launching browser...");
  switch (ENV.BROWSER) {
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
    viewport: { width: 1920, height: 1080 },
    recordVideo: { dir: "videos/" },
  });
  this.page = await this.context.newPage();
  this.page.setDefaultTimeout(ENV.TIMEOUT);
  if (ENV.BASE_URL) {
    await this.page.goto(ENV.BASE_URL);
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
