import { Page } from "@playwright/test";
import { BasePage } from "../../base.page";
import { ENV } from "../../../config/environment";

/**
 * the-internet /nested_frames — frameset with top (left/middle/right) and bottom.
 * Demonstrates reading content from a frame nested inside another frame.
 */
export class NestedFramesPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async open(): Promise<void> {
    await this.navigate(`${ENV.BASE_URL}/nested_frames`);
  }

  async getMiddleFrameText(): Promise<string> {
    const middle = this.page
      .frameLocator("frame[name='frame-top']")
      .frameLocator("frame[name='frame-middle']")
      .locator("#content");
    await middle.waitFor({ state: "visible" });
    return ((await middle.textContent()) || "").trim();
  }
}
