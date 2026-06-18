import { Page, Locator, FrameLocator, Dialog, expect } from "@playwright/test";
import { Logger } from "./logger";

export class WebActions {
  private page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  // ---------------------------------------------------------------------------
  // Navigation
  // ---------------------------------------------------------------------------
  async navigateTo(url: string): Promise<void> {
    Logger.info(`Navigating to: ${url}`);
    await this.page.goto(url, { waitUntil: "domcontentloaded" });
  }

  async reload(): Promise<void> {
    await this.page.reload({ waitUntil: "domcontentloaded" });
  }

  async goBack(): Promise<void> {
    await this.page.goBack();
  }

  // ---------------------------------------------------------------------------
  // Generic actions
  // ---------------------------------------------------------------------------
  async click(locator: Locator): Promise<void> {
    await locator.waitFor({ state: "visible" });
    await locator.click();
  }

  async doubleClick(locator: Locator): Promise<void> {
    await locator.waitFor({ state: "visible" });
    await locator.dblclick();
  }

  async rightClick(locator: Locator): Promise<void> {
    await locator.waitFor({ state: "visible" });
    await locator.click({ button: "right" });
  }

  async hover(locator: Locator): Promise<void> {
    await locator.waitFor({ state: "visible" });
    await locator.hover();
  }

  async fill(locator: Locator, text: string): Promise<void> {
    await locator.waitFor({ state: "visible" });
    await locator.fill("");
    await locator.fill(text);
  }

  async type(locator: Locator, text: string, delayMs = 0): Promise<void> {
    await locator.waitFor({ state: "visible" });
    await locator.pressSequentially(text, { delay: delayMs });
  }

  async pressKey(key: string): Promise<void> {
    await this.page.keyboard.press(key);
  }

  async clear(locator: Locator): Promise<void> {
    await locator.fill("");
  }

  // ---------------------------------------------------------------------------
  // Reads
  // ---------------------------------------------------------------------------
  async getText(locator: Locator): Promise<string> {
    await locator.waitFor({ state: "visible" });
    return (await locator.textContent())?.trim() || "";
  }

  async getValue(locator: Locator): Promise<string> {
    return await locator.inputValue();
  }

  async getAttribute(locator: Locator, name: string): Promise<string | null> {
    return await locator.getAttribute(name);
  }

  async getCount(locator: Locator): Promise<number> {
    return await locator.count();
  }

  // ---------------------------------------------------------------------------
  // State checks
  // ---------------------------------------------------------------------------
  async isVisible(locator: Locator): Promise<boolean> {
    return await locator.isVisible();
  }

  async isEnabled(locator: Locator): Promise<boolean> {
    return await locator.isEnabled();
  }

  async isChecked(locator: Locator): Promise<boolean> {
    return await locator.isChecked();
  }

  // ---------------------------------------------------------------------------
  // Waits
  // ---------------------------------------------------------------------------
  async waitForVisible(locator: Locator, timeout?: number): Promise<void> {
    await locator.waitFor({ state: "visible", timeout: timeout || 30000 });
  }

  async waitForHidden(locator: Locator, timeout?: number): Promise<void> {
    await locator.waitFor({ state: "hidden", timeout: timeout || 30000 });
  }

  async waitForAttached(locator: Locator, timeout?: number): Promise<void> {
    await locator.waitFor({ state: "attached", timeout: timeout || 30000 });
  }

  async waitForUrl(urlPart: string | RegExp, timeout?: number): Promise<void> {
    await this.page.waitForURL(urlPart as any, { timeout: timeout || 30000 });
  }

  async sleep(ms: number): Promise<void> {
    await this.page.waitForTimeout(ms);
  }

  // ---------------------------------------------------------------------------
  // Checkboxes / radios
  // ---------------------------------------------------------------------------
  async check(locator: Locator): Promise<void> {
    if (!(await locator.isChecked())) await locator.check();
  }

  async uncheck(locator: Locator): Promise<void> {
    if (await locator.isChecked()) await locator.uncheck();
  }

  async setChecked(locator: Locator, checked: boolean): Promise<void> {
    checked ? await this.check(locator) : await this.uncheck(locator);
  }

  // ---------------------------------------------------------------------------
  // Dropdowns
  // ---------------------------------------------------------------------------
  async selectByValue(locator: Locator, value: string): Promise<void> {
    await locator.selectOption({ value });
  }

  async selectByLabel(locator: Locator, label: string): Promise<void> {
    await locator.selectOption({ label });
  }

  async selectByIndex(locator: Locator, index: number): Promise<void> {
    await locator.selectOption({ index });
  }

  // ---------------------------------------------------------------------------
  // Drag and drop
  // ---------------------------------------------------------------------------
  async dragAndDrop(source: Locator, target: Locator): Promise<void> {
    await source.dragTo(target);
  }

  // ---------------------------------------------------------------------------
  // File upload
  // ---------------------------------------------------------------------------
  async uploadFile(locator: Locator, filePath: string | string[]): Promise<void> {
    await locator.setInputFiles(filePath);
  }

  // ---------------------------------------------------------------------------
  // iFrames
  // ---------------------------------------------------------------------------
  frame(selector: string): FrameLocator {
    return this.page.frameLocator(selector);
  }

  // ---------------------------------------------------------------------------
  // Alerts / dialogs — install one-shot handler that returns a Promise to await
  // ---------------------------------------------------------------------------
  acceptNextDialog(promptText?: string): Promise<string> {
    return new Promise<string>((resolve) => {
      this.page.once("dialog", async (dialog: Dialog) => {
        const message = dialog.message();
        await dialog.accept(promptText);
        resolve(message);
      });
    });
  }

  dismissNextDialog(): Promise<string> {
    return new Promise<string>((resolve) => {
      this.page.once("dialog", async (dialog: Dialog) => {
        const message = dialog.message();
        await dialog.dismiss();
        resolve(message);
      });
    });
  }

  // ---------------------------------------------------------------------------
  // Assertions (thin wrappers — page objects/steps can also call expect directly)
  // ---------------------------------------------------------------------------
  async verifyText(locator: Locator, expected: string): Promise<void> {
    await expect(locator).toHaveText(expected);
  }

  async verifyContainsText(locator: Locator, expected: string): Promise<void> {
    await expect(locator).toContainText(expected);
  }

  async verifyUrl(expectedUrl: string | RegExp): Promise<void> {
    await expect(this.page).toHaveURL(expectedUrl as any);
  }

  async verifyTitle(expectedTitle: string | RegExp): Promise<void> {
    await expect(this.page).toHaveTitle(expectedTitle as any);
  }

  // ---------------------------------------------------------------------------
  // HTTP Basic Auth — sets the Authorization header for subsequent navigations
  // ---------------------------------------------------------------------------
  async setBasicAuthHeader(username: string, password: string): Promise<void> {
    const token = Buffer.from(`${username}:${password}`).toString("base64");
    await this.page.setExtraHTTPHeaders({ Authorization: `Basic ${token}` });
  }

  // ---------------------------------------------------------------------------
  // Misc
  // ---------------------------------------------------------------------------
  async takeScreenshot(name: string): Promise<Buffer> {
    return await this.page.screenshot({ path: `screenshots/${name}.png`, fullPage: true });
  }

  async scrollIntoView(locator: Locator): Promise<void> {
    await locator.scrollIntoViewIfNeeded();
  }

  async getCurrentUrl(): Promise<string> {
    return this.page.url();
  }

  async getTitle(): Promise<string> {
    return await this.page.title();
  }
}
