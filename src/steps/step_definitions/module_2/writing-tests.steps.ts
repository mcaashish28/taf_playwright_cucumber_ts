import { Given, Then } from "@cucumber/cucumber";
import { expect } from "@playwright/test";
import { ICustomWorld } from "../../../support/custom-world";
import { WritingTestsPage } from "../../../pages/writing-tests.page";

let writingTestsPage: WritingTestsPage;

Given("I navigate to the Writing Tests page", async function (this: ICustomWorld) {
  writingTestsPage = new WritingTestsPage(this.page!);
  await writingTestsPage.navigateToWritingTestsPage();
});

Then("I should see the {string} section on the page", async function (this: ICustomWorld, sectionText: string) {
  const isVisible = await writingTestsPage.isSectionVisible(sectionText);
  expect(isVisible).toBeTruthy();
});

Then("the page URL should contain {string}", async function (this: ICustomWorld, expectedUrlPart: string) {
  const currentUrl = await writingTestsPage.getCurrentUrl();
  expect(currentUrl).toContain(expectedUrlPart);
});
