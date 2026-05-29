import { Page, Locator, expect } from "@playwright/test";
import { Logger } from "./logger";

export class WebActions {
  private page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async navigateTo(url: string): Promise<void> {
    Logger.info(`Navigating to: ${url}`);
    await this.page.goto(url, { waitUntil: "networkidle" });
  }

  async click(locator: Locator): Promise<void> {
    await locator.waitFor({ state: "visible" });
    await locator.click();
  }

  async fill(locator: Locator, text: string): Promise<void> {
    await locator.waitFor({ state: "visible" });
    await locator.clear();
    await locator.fill(text);
  }

  async getText(locator: Locator): Promise<string> {
    await locator.waitFor({ state: "visible" });
    return (await locator.textContent()) || "";
  }

  async isVisible(locator: Locator): Promise<boolean> {
    return await locator.isVisible();
  }

  async waitForElement(locator: Locator, timeout?: number): Promise<void> {
    await locator.waitFor({ state: "visible", timeout: timeout || 30000 });
  }

  async selectOption(locator: Locator, value: string): Promise<void> {
    await locator.selectOption(value);
  }

  async verifyText(locator: Locator, expectedText: string): Promise<void> {
    await expect(locator).toHaveText(expectedText);
  }

  async verifyUrl(expectedUrl: string): Promise<void> {
    await expect(this.page).toHaveURL(expectedUrl);
  }

  async takeScreenshot(name: string): Promise<Buffer> {
    return await this.page.screenshot({ path: `screenshots/${name}.png`, fullPage: true });
  }
}
