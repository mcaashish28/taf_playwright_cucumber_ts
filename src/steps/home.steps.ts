import { Given, When, Then } from "@cucumber/cucumber";
import { expect } from "@playwright/test";
import { ICustomWorld } from "../support/custom-world";
import { LoginPage } from "../pages/login.page";
import { HomePage } from "../pages/home.page";

let homePage: HomePage;

Given(
  "I am logged in as {string} with password {string}",
  async function (this: ICustomWorld, username: string, password: string) {
    const loginPage = new LoginPage(this.page!);
    await loginPage.navigateToLoginPage();
    await loginPage.login(username, password);
    homePage = new HomePage(this.page!);
  }
);

Then("I should see the welcome message", async function (this: ICustomWorld) {
  const message = await homePage.getWelcomeMessage();
  expect(message).toBeTruthy();
});

Then("I should see the logout button", async function (this: ICustomWorld) {
  const isVisible = await homePage.isLogoutButtonVisible();
  expect(isVisible).toBeTruthy();
});

When("I click the logout button", async function (this: ICustomWorld) {
  await homePage.clickLogout();
});

Then("I should be redirected to the login page", async function (this: ICustomWorld) {
  await this.page!.waitForURL("**/login");
});
