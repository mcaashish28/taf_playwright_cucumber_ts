import { Page, Locator } from "@playwright/test";
import { BasePage } from "../../base.page";
import { ENV } from "../../../config/environment";

export class DynamicLoadingPage extends BasePage {
  private readonly startButton: Locator;
  private readonly finishText: Locator;
  private readonly loader: Locator;

  constructor(page: Page) {
    super(page);
    this.startButton = page.locator("#start button");
    this.finishText = page.locator("#finish h4");
    this.loader = page.locator("#loading");
  }

  async open(example: 1 | 2 = 1): Promise<void> {
    await this.navigate(`${ENV.BASE_URL}/dynamic_loading/${example}`);
  }

  async start(): Promise<void> {
    await this.webActions.click(this.startButton);
  }

  async waitForFinish(timeoutMs = 15000): Promise<void> {
    await this.webActions.waitForHidden(this.loader, timeoutMs);
    await this.webActions.waitForVisible(this.finishText, timeoutMs);
  }

  async getFinishText(): Promise<string> {
    return await this.webActions.getText(this.finishText);
  }
}
