import { Page, Locator } from "@playwright/test";
import { BasePage } from "../../base.page";
import { ENV } from "../../../config/environment";

/** the-internet /basic_auth — HTTP basic authentication. */
export class BasicAuthPage extends BasePage {
  private readonly content: Locator;

  constructor(page: Page) {
    super(page);
    this.content = page.locator(".example p");
  }

  async openWithCredentials(username: string, password: string): Promise<void> {
    await this.webActions.setBasicAuthHeader(username, password);
    await this.navigate(`${ENV.BASE_URL}/basic_auth`);
  }

  async getContentText(): Promise<string> {
    return await this.webActions.getText(this.content);
  }
}
