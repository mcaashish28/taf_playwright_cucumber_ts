import { Page } from "@playwright/test";
import { WebActions } from "../utils/web-actions";

export class BasePage {
  protected page: Page;
  protected webActions: WebActions;

  constructor(page: Page) {
    this.page = page;
    this.webActions = new WebActions(page);
  }

  async navigate(url: string): Promise<void> {
    await this.webActions.navigateTo(url);
  }

  async getTitle(): Promise<string> {
    return await this.page.title();
  }

  async getCurrentUrl(): Promise<string> {
    return this.page.url();
  }
}
