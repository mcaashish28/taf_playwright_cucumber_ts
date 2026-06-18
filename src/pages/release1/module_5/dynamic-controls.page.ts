import { Page, Locator } from "@playwright/test";
import { BasePage } from "../../base.page";
import { ENV } from "../../../config/environment";

/** the-internet /dynamic_controls — enable a disabled input, then type into it. */
export class DynamicControlsPage extends BasePage {
  private readonly input: Locator;
  private readonly enableButton: Locator;

  constructor(page: Page) {
    super(page);
    this.input = page.locator("#input-example input");
    this.enableButton = page.locator("#input-example button");
  }

  async open(): Promise<void> {
    await this.navigate(`${ENV.BASE_URL}/dynamic_controls`);
  }

  async enableInputAndType(text: string): Promise<void> {
    await this.webActions.click(this.enableButton); // "Enable"
    await this.input.waitFor({ state: "visible" });
    // Wait until the field is actually enabled before typing
    await this.page.waitForFunction(
      (sel) => {
        const el = document.querySelector(sel) as HTMLInputElement | null;
        return el !== null && !el.disabled;
      },
      "#input-example input",
    );
    await this.webActions.fill(this.input, text);
  }

  async getInputValue(): Promise<string> {
    return await this.webActions.getValue(this.input);
  }
}
