import { Page, Locator } from "@playwright/test";
import { BasePage } from "../../base.page";
import { ENV } from "../../../config/environment";

export class LoginPage extends BasePage {
  private readonly username: Locator;
  private readonly password: Locator;
  private readonly loginButton: Locator;
  private readonly flashMessage: Locator;
  private readonly secureAreaHeading: Locator;
  private readonly logoutButton: Locator;

  constructor(page: Page) {
    super(page);
    this.username = page.locator("#username");
    this.password = page.locator("#password");
    this.loginButton = page.getByRole("button", { name: "Login" });
    this.flashMessage = page.locator("#flash");
    this.secureAreaHeading = page.locator("h2", { hasText: "Secure Area" });
    this.logoutButton = page.getByRole("link", { name: "Logout" });
  }

  async open(): Promise<void> {
    await this.navigate(`${ENV.BASE_URL}/login`);
  }

  async login(user: string, pass: string): Promise<void> {
    await this.webActions.fill(this.username, user);
    await this.webActions.fill(this.password, pass);
    await this.webActions.click(this.loginButton);
  }

  async getFlashMessage(): Promise<string> {
    return await this.webActions.getText(this.flashMessage);
  }

  async isOnSecureArea(): Promise<boolean> {
    return await this.webActions.isVisible(this.secureAreaHeading);
  }

  async logout(): Promise<void> {
    if (await this.webActions.isVisible(this.logoutButton)) {
      await this.webActions.click(this.logoutButton);
    }
  }
}
