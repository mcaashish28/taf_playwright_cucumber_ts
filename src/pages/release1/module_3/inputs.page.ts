import { Page, Locator } from "@playwright/test";
import { BasePage } from "../../base.page";
import { ENV } from "../../../config/environment";

/** the-internet /inputs — a single number input. */
export class InputsPage extends BasePage {
  private readonly numberInput: Locator;

  constructor(page: Page) {
    super(page);
    this.numberInput = page.locator("input[type='number']");
  }

  async open(): Promise<void> {
    await this.navigate(`${ENV.BASE_URL}/inputs`);
  }

  async enterNumber(value: string): Promise<void> {
    await this.webActions.fill(this.numberInput, value);
  }

  async getNumberValue(): Promise<string> {
    return await this.webActions.getValue(this.numberInput);
  }
}
