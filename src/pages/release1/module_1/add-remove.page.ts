import { Page, Locator, expect } from "@playwright/test";
import { BasePage } from "../../base.page";
import { ENV } from "../../../config/environment";

export class AddRemoveElementsPage extends BasePage {
  private readonly addButton: Locator;
  private readonly deleteButtons: Locator;

  constructor(page: Page) {
    super(page);
    this.addButton = page.getByRole("button", { name: "Add Element" });
    this.deleteButtons = page.locator("#elements button.added-manually");
  }

  async open(): Promise<void> {
    await this.navigate(`${ENV.BASE_URL}/add_remove_elements/`);
  }

  async addElements(count: number): Promise<void> {
    for (let i = 0; i < count; i++) {
      await this.webActions.click(this.addButton);
      await expect(this.deleteButtons).toHaveCount(i + 1);
    }
  }

  async removeElements(count: number): Promise<void> {
    for (let i = 0; i < count; i++) {
      const remainingBefore = await this.deleteButtons.count();
      if (remainingBefore === 0) break;
      await this.deleteButtons.first().click();
      await expect(this.deleteButtons).toHaveCount(remainingBefore - 1);
    }
  }

  async getRemainingCount(): Promise<number> {
    return await this.deleteButtons.count();
  }
}
