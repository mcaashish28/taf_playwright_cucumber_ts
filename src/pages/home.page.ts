import { Page, Locator } from "@playwright/test";
import { BasePage } from "./base.page";

export class HomePage extends BasePage {
  // Locators
  private readonly welcomeMessage: Locator;
  private readonly logoutButton: Locator;
  private readonly searchInput: Locator;

  constructor(page: Page) {
    super(page);
    this.welcomeMessage = page.locator(".welcome-message");
    this.logoutButton = page.locator("#logout-button");
    this.searchInput = page.locator("#search-input");
  }

  async getWelcomeMessage(): Promise<string> {
    return await this.webActions.getText(this.welcomeMessage);
  }

  async clickLogout(): Promise<void> {
    await this.webActions.click(this.logoutButton);
  }

  async search(query: string): Promise<void> {
    await this.webActions.fill(this.searchInput, query);
  }

  async isLogoutButtonVisible(): Promise<boolean> {
    return await this.webActions.isVisible(this.logoutButton);
  }
}
