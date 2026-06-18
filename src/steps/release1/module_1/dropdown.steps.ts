import { Given, When, Then } from "@cucumber/cucumber";
import { expect } from "@playwright/test";
import { ICustomWorld } from "../../../support/custom-world";
import { DropdownPage } from "../../../pages/release1/module_1/dropdown.page";
import { getTestData } from "../../../utils/excel.helper";

Given("I open the Dropdown page", async function (this: ICustomWorld) {
  const page = new DropdownPage(this.page!);
  await page.open();
  this.dropdownPage = page;
});

When(
  "I select dropdown option from test data {string}",
  async function (this: ICustomWorld, key: string) {
    const label = await getTestData(key);
    await (this.dropdownPage as DropdownPage).selectByLabel(label);
  },
);

Then(
  "the selected dropdown option should match test data {string}",
  async function (this: ICustomWorld, key: string) {
    const expected = await getTestData(key);
    const actual = await (this.dropdownPage as DropdownPage).getSelectedLabel();
    expect(actual).toBe(expected);
  },
);
