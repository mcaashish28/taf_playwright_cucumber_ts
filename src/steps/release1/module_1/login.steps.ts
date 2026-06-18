import { Given, When, Then } from "@cucumber/cucumber";
import { expect } from "@playwright/test";
import { ICustomWorld } from "../../../support/custom-world";
import { LoginPage } from "../../../pages/release1/module_1/login.page";
import { getTestData } from "../../../utils/excel.helper";

Given("I open the Login page", async function (this: ICustomWorld) {
  const loginPage = new LoginPage(this.page!);
  await loginPage.open();
  this.loginPage = loginPage;
});

When(
  "I login using test data {string} and {string}",
  async function (this: ICustomWorld, userKey: string, passKey: string) {
    const user = await getTestData(userKey);
    const pass = await getTestData(passKey);
    const loginPage: LoginPage = this.loginPage;
    await loginPage.login(user, pass);
  },
);

Then("I should land on the Secure Area", async function (this: ICustomWorld) {
  const loginPage: LoginPage = this.loginPage;
  expect(await loginPage.isOnSecureArea()).toBeTruthy();
});

Then(
  "the flash message should contain test data {string}",
  async function (this: ICustomWorld, key: string) {
    const expected = await getTestData(key);
    const loginPage: LoginPage = this.loginPage;
    const actual = await loginPage.getFlashMessage();
    expect(actual).toContain(expected);
  },
);
