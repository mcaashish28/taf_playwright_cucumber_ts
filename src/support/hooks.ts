import { Before, After, BeforeAll, AfterAll, Status, setDefaultTimeout } from "@cucumber/cucumber";
import { chromium, firefox, webkit, Browser } from "@playwright/test";
import { ICustomWorld } from "./custom-world";
import { ENV } from "../config/environment";
import { browserOptions } from "../config/browser-options";
import { Logger } from "../utils/logger";

setDefaultTimeout(60000);

let browser: Browser;

BeforeAll(async function () {
  Logger.info("Launching browser...");
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
  Logger.info(`Starting scenario: ${this.testName}`);

  this.context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    recordVideo: { dir: "videos/" },
  });
  this.page = await this.context.newPage();
  this.page.setDefaultTimeout(ENV.TIMEOUT);
});

After(async function (this: ICustomWorld, scenario) {
  Logger.info(`Finished scenario: ${this.testName} - Status: ${scenario.result?.status}`);

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
  Logger.info("Closing browser...");
  if (browser) {
    await browser.close();
  }

  // Auto-generate custom HTML report from JSON
  setTimeout(() => {
    try {
      const { generateReport } = require("./reporters/custom-reporter");
      generateReport();
    } catch (e) {
      Logger.warn("Could not auto-generate HTML report. Run 'npm run report' manually.");
    }
  }, 2000);
});
