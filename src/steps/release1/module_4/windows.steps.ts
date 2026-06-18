import { Given, When, Then } from "@cucumber/cucumber";
import { expect } from "@playwright/test";
import { ICustomWorld } from "../../../support/custom-world";
import { WindowsPage } from "../../../pages/release1/module_4/windows.page";
import { getTestData } from "../../../utils/excel.helper";

Given("I open the Multiple Windows page", async function (this: ICustomWorld) {
  const page = new WindowsPage(this.page!);
  await page.open();
  this.windowsPage = page;
});

When("I open the new window", async function (this: ICustomWorld) {
  this.newWindowHeading = await (this.windowsPage as WindowsPage).openNewWindowAndReadHeading();
});

Then(
  "the new window heading should match test data {string}",
  async function (this: ICustomWorld, key: string) {
    const expected = await getTestData(key);
    expect(this.newWindowHeading).toBe(expected);
  },
);
