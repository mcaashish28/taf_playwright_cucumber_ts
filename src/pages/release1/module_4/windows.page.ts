import { Page, Locator } from "@playwright/test";
import { BasePage } from "../../base.page";
import { ENV } from "../../../config/environment";
import { openNewPage } from "../../../utils/browser-helper";

/** the-internet /windows — "Click Here" opens a new browser window/tab. */
export class WindowsPage extends BasePage {
  private readonly clickHere: Locator;

  constructor(page: Page) {
    super(page);
    this.clickHere = page.getByRole("link", { name: "Click Here" });
  }

  async open(): Promise<void> {
    await this.navigate(`${ENV.BASE_URL}/windows`);
  }

  /** Open the new window and return the heading text shown there. */
  async openNewWindowAndReadHeading(): Promise<string> {
    const newPage = await openNewPage(this.page.context(), async () => {
      await this.clickHere.click();
    });
    const heading = newPage.locator("h3");
    await heading.waitFor({ state: "visible" });
    const text = ((await heading.textContent()) || "").trim();
    await newPage.close();
    return text;
  }
}
