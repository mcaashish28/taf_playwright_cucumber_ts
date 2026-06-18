import { Page, Locator } from "@playwright/test";
import { BasePage } from "../../base.page";
import { ENV } from "../../../config/environment";

export class HoversPage extends BasePage {
  private readonly figures: Locator;

  constructor(page: Page) {
    super(page);
    this.figures = page.locator(".figure");
  }

  async open(): Promise<void> {
    await this.navigate(`${ENV.BASE_URL}/hovers`);
  }

  async hoverUser(index: number): Promise<void> {
    await this.webActions.hover(this.figures.nth(index));
  }

  async getCaption(index: number): Promise<string> {
    const caption = this.figures.nth(index).locator(".figcaption h5");
    return await this.webActions.getText(caption);
  }
}
