import { Given, When, Then } from "@cucumber/cucumber";
import { expect } from "@playwright/test";
import { ICustomWorld } from "../support/custom-world";
import { LoginPage } from "../pages/login.page";

let loginPage: LoginPage;

Given("I am on the login page", async function (this: ICustomWorld) {
  loginPage = new LoginPage(this.page!);
  await loginPage.navigateToLoginPage();
});

When("I enter username {string}", async function (this: ICustomWorld, username: string) {
  await loginPage.enterUsername(username);
});

When("I enter password {string}", async function (this: ICustomWorld, password: string) {
  await loginPage.enterPassword(password);
});

When("I click the login button", async function (this: ICustomWorld) {
  await loginPage.clickLogin();
});

Then("I should be redirected to the home page", async function (this: ICustomWorld) {
  await this.page!.waitForURL("**/home");
});

Then("I should see an error message {string}", async function (this: ICustomWorld, message: string) {
  const errorText = await loginPage.getErrorMessage();
  expect(errorText).toContain(message);
});
