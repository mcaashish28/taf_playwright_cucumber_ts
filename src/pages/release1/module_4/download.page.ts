import { Page, Locator } from "@playwright/test";
import { BasePage } from "../../base.page";
import { ENV } from "../../../config/environment";
import { downloadFile } from "../../../utils/browser-helper";

/** the-internet /download — a list of downloadable file links. */
export class DownloadPage extends BasePage {
  private readonly fileLinks: Locator;

  constructor(page: Page) {
    super(page);
    this.fileLinks = page.locator(".example a");
  }

  async open(): Promise<void> {
    await this.navigate(`${ENV.BASE_URL}/download`);
  }

  /** Download the first available file and return its saved details. */
  async downloadFirstFile(): Promise<{ fileName: string; savedPath: string }> {
    const firstLink = this.fileLinks.first();
    await firstLink.waitFor({ state: "visible" });
    return await downloadFile(this.page, async () => {
      await firstLink.click();
    });
  }
}
