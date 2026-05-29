import { Page, Locator } from "@playwright/test";
import { BasePage } from "./base.page";
import { ENV } from "../config/environment";

export class LoginPage extends BasePage {
  // Locators
  private readonly usernameInput: Locator;
  private readonly passwordInput: Locator;
  private readonly loginButton: Locator;
  private readonly errorMessage: Locator;

  constructor(page: Page) {
    super(page);
    this.usernameInput = page.locator("#username");
    this.passwordInput = page.locator("#password");
    this.loginButton = page.locator("#login-button");
    this.errorMessage = page.locator(".error-message");
  }

  async navigateToLoginPage(): Promise<void> {
    await this.navigate(`${ENV.BASE_URL}/login`);
  }

  async enterUsername(username: string): Promise<void> {
    await this.webActions.fill(this.usernameInput, username);
  }

  async enterPassword(password: string): Promise<void> {
    await this.webActions.fill(this.passwordInput, password);
  }

  async clickLogin(): Promise<void> {
    await this.webActions.click(this.loginButton);
  }

  async login(username: string, password: string): Promise<void> {
    await this.enterUsername(username);
    await this.enterPassword(password);
    await this.clickLogin();
  }

  async getErrorMessage(): Promise<string> {
    return await this.webActions.getText(this.errorMessage);
  }

  async isErrorDisplayed(): Promise<boolean> {
    return await this.webActions.isVisible(this.errorMessage);
  }
}
