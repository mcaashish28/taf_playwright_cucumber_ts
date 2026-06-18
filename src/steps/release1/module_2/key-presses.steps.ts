import { Given, When, Then } from "@cucumber/cucumber";
import { expect } from "@playwright/test";
import { ICustomWorld } from "../../../support/custom-world";
import { KeyPressesPage } from "../../../pages/release1/module_2/key-presses.page";
import { getTestData } from "../../../utils/excel.helper";

Given("I open the Key Presses page", async function (this: ICustomWorld) {
  const page = new KeyPressesPage(this.page!);
  await page.open();
  this.keyPressesPage = page;
});

When(
  "I press the key from test data {string}",
  async function (this: ICustomWorld, key: string) {
    const value = await getTestData(key);
    await (this.keyPressesPage as KeyPressesPage).press(value);
  },
);

Then(
  "the key press result should match test data {string}",
  async function (this: ICustomWorld, key: string) {
    const expected = await getTestData(key);
    const actual = await (this.keyPressesPage as KeyPressesPage).getResult();
    expect(actual).toBe(expected);
  },
);
