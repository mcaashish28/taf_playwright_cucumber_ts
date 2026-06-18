import { Page, Locator } from "@playwright/test";
import { BasePage } from "../../base.page";
import { ENV } from "../../../config/environment";

/** the-internet /disappearing_elements — a menu whose items vary between loads. */
export class DisappearingElementsPage extends BasePage {
  private readonly menuItems: Locator;

  constructor(page: Page) {
    super(page);
    this.menuItems = page.locator("ul li a");
  }

  async open(): Promise<void> {
    await this.navigate(`${ENV.BASE_URL}/disappearing_elements`);
  }

  async getMenuItems(): Promise<string[]> {
    const count = await this.menuItems.count();
    const items: string[] = [];
    for (let i = 0; i < count; i++) {
      items.push(((await this.menuItems.nth(i).textContent()) || "").trim());
    }
    return items;
  }

  async isMenuItemPresent(name: string): Promise<boolean> {
    return (await this.getMenuItems()).includes(name);
  }
}
