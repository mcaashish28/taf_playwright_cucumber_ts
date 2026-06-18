import { Page, Locator } from "@playwright/test";
import { BasePage } from "../../base.page";
import { ENV } from "../../../config/environment";

/** the-internet /horizontal_slider — range input from 0 to 5, step 0.5. */
export class SliderPage extends BasePage {
  private readonly slider: Locator;
  private readonly rangeValue: Locator;

  constructor(page: Page) {
    super(page);
    this.slider = page.locator("input[type='range']");
    this.rangeValue = page.locator("#range");
  }

  async open(): Promise<void> {
    await this.navigate(`${ENV.BASE_URL}/horizontal_slider`);
  }

  async setValue(value: string): Promise<void> {
    await this.slider.fill(value);
  }

  async getValue(): Promise<string> {
    return await this.webActions.getText(this.rangeValue);
  }
}
