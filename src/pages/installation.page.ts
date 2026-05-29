import { Page, Locator } from "@playwright/test";
import { BasePage } from "./base.page";
import { ENV } from "../config/environment";

export class InstallationPage extends BasePage {
  private readonly pageHeading: Locator;
  private readonly sidebarNav: Locator;

  constructor(page: Page) {
    super(page);
    this.pageHeading = page.locator("article h1");
    this.sidebarNav = page.locator(".menu__link");
  }

  async navigateToInstallationPage(): Promise<void> {
    await this.navigate(`${ENV.BASE_URL}/docs/intro`);
    await this.pageHeading.waitFor({ state: "visible", timeout: 10000 });
  }

  async getPageHeadingText(): Promise<string> {
    return (await this.pageHeading.textContent()) || "";
  }

  async isSidebarLinkVisible(linkText: string): Promise<boolean> {
    const link = this.page.locator(`.menu__link`, { hasText: linkText }).first();
    return await link.isVisible();
  }
}
