import { Page, Locator } from "@playwright/test";
import { BasePage } from "../../base.page";
import { ENV } from "../../../config/environment";
import { scrollToBottom } from "../../../utils/browser-helper";

/** the-internet /infinite_scroll — paragraphs are appended as you scroll down. */
export class InfiniteScrollPage extends BasePage {
  private readonly paragraphs: Locator;

  constructor(page: Page) {
    super(page);
    this.paragraphs = page.locator(".jscroll-added");
  }

  async open(): Promise<void> {
    await this.navigate(`${ENV.BASE_URL}/infinite_scroll`);
  }

  async getParagraphCount(): Promise<number> {
    return await this.paragraphs.count();
  }

  async scrollDown(times: number): Promise<void> {
    await scrollToBottom(this.page, times, 800);
  }
}
