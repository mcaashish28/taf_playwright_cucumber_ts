import { Given, When, Then } from "@cucumber/cucumber";
import { expect } from "@playwright/test";
import { ICustomWorld } from "../../../support/custom-world";
import { InputsPage } from "../../../pages/release1/module_3/inputs.page";
import { getTestData } from "../../../utils/excel.helper";

Given("I open the Inputs page", async function (this: ICustomWorld) {
  const page = new InputsPage(this.page!);
  await page.open();
  this.inputsPage = page;
});

When(
  "I enter the number from test data {string}",
  async function (this: ICustomWorld, key: string) {
    const value = await getTestData(key);
    await (this.inputsPage as InputsPage).enterNumber(value);
  },
);

Then(
  "the input value should match test data {string}",
  async function (this: ICustomWorld, key: string) {
    const expected = await getTestData(key);
    const actual = await (this.inputsPage as InputsPage).getNumberValue();
    expect(actual).toBe(expected);
  },
);
