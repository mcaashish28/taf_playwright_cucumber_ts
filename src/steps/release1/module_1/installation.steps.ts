import { Given, Then } from "@cucumber/cucumber";
import { expect } from "@playwright/test";
import { ICustomWorld } from "../../../support/custom-world";
import { InstallationPage } from "../../../pages/installation.page";

Given("I navigate to the Installation page", async function (this: ICustomWorld) {
  const installationPage = new InstallationPage(this.page!);
  await installationPage.navigateToInstallationPage();
});

Then("the page title should contain {string}", async function (this: ICustomWorld, expectedTitle: string) {
  const title = await this.page!.title();
  expect(title).toContain(expectedTitle);
});

Then("the page heading should display {string}", async function (this: ICustomWorld, expectedHeading: string) {
  const heading = await this.page!.locator("article h1").textContent();
  expect(heading).toContain(expectedHeading);
});

Then("I should see the {string} link in the sidebar", async function (this: ICustomWorld, linkText: string) {
  const link = this.page!.locator(`.menu__link`, { hasText: linkText }).first();
  const isVisible = await link.isVisible();
  expect(isVisible).toBeTruthy();
});
