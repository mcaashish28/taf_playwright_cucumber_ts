import { Given, When, Then } from "@cucumber/cucumber";
import { expect } from "@playwright/test";
import { ICustomWorld } from "../../../support/custom-world";
import { AddRemoveElementsPage } from "../../../pages/release1/module_1/add-remove.page";
import { getTestData } from "../../../utils/excel.helper";

Given("I open the Add Remove Elements page", async function (this: ICustomWorld) {
  const page = new AddRemoveElementsPage(this.page!);
  await page.open();
  this.addRemovePage = page;
});

When(
  "I add elements from test data {string}",
  async function (this: ICustomWorld, key: string) {
    const count = parseInt(await getTestData(key), 10);
    await (this.addRemovePage as AddRemoveElementsPage).addElements(count);
  },
);

When(
  "I remove elements from test data {string}",
  async function (this: ICustomWorld, key: string) {
    const count = parseInt(await getTestData(key), 10);
    await (this.addRemovePage as AddRemoveElementsPage).removeElements(count);
  },
);

Then(
  "the remaining element count should be {int}",
  async function (this: ICustomWorld, expected: number) {
    const actual = await (this.addRemovePage as AddRemoveElementsPage).getRemainingCount();
    expect(actual).toBe(expected);
  },
);
