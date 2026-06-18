import { Given, When, Then } from "@cucumber/cucumber";
import { expect } from "@playwright/test";
import { ICustomWorld } from "../../../support/custom-world";
import { DynamicControlsPage } from "../../../pages/release1/module_5/dynamic-controls.page";
import { getTestData } from "../../../utils/excel.helper";

Given("I open the Dynamic Controls page", async function (this: ICustomWorld) {
  const page = new DynamicControlsPage(this.page!);
  await page.open();
  this.dynamicControlsPage = page;
});

When(
  "I enable the input and type test data {string}",
  async function (this: ICustomWorld, key: string) {
    const text = await getTestData(key);
    await (this.dynamicControlsPage as DynamicControlsPage).enableInputAndType(text);
  },
);

Then(
  "the dynamic input value should match test data {string}",
  async function (this: ICustomWorld, key: string) {
    const expected = await getTestData(key);
    const actual = await (this.dynamicControlsPage as DynamicControlsPage).getInputValue();
    expect(actual).toBe(expected);
  },
);
