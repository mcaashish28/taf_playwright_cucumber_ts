import { Page, Locator } from "@playwright/test";
import { BasePage } from "../../base.page";
import { ENV } from "../../../config/environment";

export class CheckboxesPage extends BasePage {
  private readonly checkboxes: Locator;

  constructor(page: Page) {
    super(page);
    this.checkboxes = page.locator("#checkboxes input[type='checkbox']");
  }

  async open(): Promise<void> {
    await this.navigate(`${ENV.BASE_URL}/checkboxes`);
  }

  checkboxAt(index: number): Locator {
    return this.checkboxes.nth(index);
  }

  async setState(index: number, checked: boolean): Promise<void> {
    await this.webActions.setChecked(this.checkboxAt(index), checked);
  }

  async isChecked(index: number): Promise<boolean> {
    return await this.webActions.isChecked(this.checkboxAt(index));
  }
}
