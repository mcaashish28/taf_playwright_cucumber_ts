import { Given, When, Then } from "@cucumber/cucumber";
import { expect } from "@playwright/test";
import { ICustomWorld } from "../../../support/custom-world";
import { DynamicLoadingPage } from "../../../pages/release1/module_2/dynamic-loading.page";
import { getTestData } from "../../../utils/excel.helper";

Given("I open the Dynamic Loading page", async function (this: ICustomWorld) {
  const page = new DynamicLoadingPage(this.page!);
  await page.open(1);
  this.dynamicLoadingPage = page;
});

When("I start the dynamic loading process", async function (this: ICustomWorld) {
  const page = this.dynamicLoadingPage as DynamicLoadingPage;
  await page.start();
  await page.waitForFinish();
});

Then(
  "the finish text should match test data {string}",
  async function (this: ICustomWorld, key: string) {
    const expected = await getTestData(key);
    const actual = await (this.dynamicLoadingPage as DynamicLoadingPage).getFinishText();
    expect(actual).toBe(expected);
  },
);
