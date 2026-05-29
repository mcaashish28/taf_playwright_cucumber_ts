import { Page, Locator } from "@playwright/test";
import { BasePage } from "./base.page";
import { ENV } from "../config/environment";

export class WritingTestsPage extends BasePage {
  private readonly pageHeading: Locator;
  private readonly articleContent: Locator;

  constructor(page: Page) {
    super(page);
    this.pageHeading = page.locator("article h1");
    this.articleContent = page.locator("article");
  }

  async navigateToWritingTestsPage(): Promise<void> {
    await this.navigate(`${ENV.BASE_URL}/docs/writing-tests`);
    await this.pageHeading.waitFor({ state: "visible", timeout: 10000 });
  }

  async getPageHeadingText(): Promise<string> {
    return (await this.pageHeading.textContent()) || "";
  }

  async isSectionVisible(sectionText: string): Promise<boolean> {
    const section = this.articleContent.locator(`h2`, { hasText: sectionText }).first();
    return await section.isVisible();
  }
}
