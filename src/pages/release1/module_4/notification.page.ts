import { Page, Locator } from "@playwright/test";
import { BasePage } from "../../base.page";
import { ENV } from "../../../config/environment";

/** the-internet /notification_message_rendered — click triggers a flash message. */
export class NotificationPage extends BasePage {
  private readonly clickHere: Locator;
  private readonly flash: Locator;

  constructor(page: Page) {
    super(page);
    this.clickHere = page.getByRole("link", { name: "Click here" });
    this.flash = page.locator("#flash");
  }

  async open(): Promise<void> {
    await this.navigate(`${ENV.BASE_URL}/notification_message_rendered`);
  }

  async triggerNotification(): Promise<string> {
    await this.webActions.click(this.clickHere);
    return await this.webActions.getText(this.flash);
  }
}
