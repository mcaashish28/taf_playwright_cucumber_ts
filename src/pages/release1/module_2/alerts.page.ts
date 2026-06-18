import { Page, Locator } from "@playwright/test";
import { BasePage } from "../../base.page";
import { ENV } from "../../../config/environment";

export class JsAlertsPage extends BasePage {
  private readonly jsAlertButton: Locator;
  private readonly jsConfirmButton: Locator;
  private readonly jsPromptButton: Locator;
  private readonly result: Locator;

  constructor(page: Page) {
    super(page);
    this.jsAlertButton = page.getByRole("button", { name: "Click for JS Alert" });
    this.jsConfirmButton = page.getByRole("button", { name: "Click for JS Confirm" });
    this.jsPromptButton = page.getByRole("button", { name: "Click for JS Prompt" });
    this.result = page.locator("#result");
  }

  async open(): Promise<void> {
    await this.navigate(`${ENV.BASE_URL}/javascript_alerts`);
  }

  async triggerAlert(): Promise<string> {
    const dialogMsg = this.webActions.acceptNextDialog();
    await this.webActions.click(this.jsAlertButton);
    return await dialogMsg;
  }

  async triggerConfirm(accept: boolean): Promise<string> {
    const dialogMsg = accept
      ? this.webActions.acceptNextDialog()
      : this.webActions.dismissNextDialog();
    await this.webActions.click(this.jsConfirmButton);
    return await dialogMsg;
  }

  async triggerPrompt(input: string): Promise<string> {
    const dialogMsg = this.webActions.acceptNextDialog(input);
    await this.webActions.click(this.jsPromptButton);
    return await dialogMsg;
  }

  async getResult(): Promise<string> {
    return await this.webActions.getText(this.result);
  }
}
