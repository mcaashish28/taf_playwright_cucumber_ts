import { Page, Locator } from "@playwright/test";
import { BasePage } from "../../base.page";
import { ENV } from "../../../config/environment";

export class KeyPressesPage extends BasePage {
  private readonly target: Locator;
  private readonly result: Locator;

  constructor(page: Page) {
    super(page);
    this.target = page.locator("#target");
    this.result = page.locator("#result");
  }

  async open(): Promise<void> {
    await this.navigate(`${ENV.BASE_URL}/key_presses`);
  }

  async press(key: string): Promise<void> {
    await this.webActions.click(this.target);
    await this.webActions.pressKey(key);
  }

  async getResult(): Promise<string> {
    return await this.webActions.getText(this.result);
  }
}
