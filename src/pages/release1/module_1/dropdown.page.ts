import { Page, Locator } from "@playwright/test";
import { BasePage } from "../../base.page";
import { ENV } from "../../../config/environment";

export class DropdownPage extends BasePage {
  private readonly dropdown: Locator;

  constructor(page: Page) {
    super(page);
    this.dropdown = page.locator("#dropdown");
  }

  async open(): Promise<void> {
    await this.navigate(`${ENV.BASE_URL}/dropdown`);
  }

  async selectByLabel(label: string): Promise<void> {
    await this.webActions.selectByLabel(this.dropdown, label);
  }

  async getSelectedLabel(): Promise<string> {
    return await this.dropdown
      .locator("option:checked")
      .innerText();
  }
}
