import { Given, When, Then } from "@cucumber/cucumber";
import { expect } from "@playwright/test";
import { ICustomWorld } from "../../../support/custom-world";
import { CheckboxesPage } from "../../../pages/release1/module_1/checkboxes.page";

Given("I open the Checkboxes page", async function (this: ICustomWorld) {
  const page = new CheckboxesPage(this.page!);
  await page.open();
  this.checkboxesPage = page;
});

When(
  "I check checkbox at index {int}",
  async function (this: ICustomWorld, index: number) {
    await (this.checkboxesPage as CheckboxesPage).setState(index, true);
  },
);

When(
  "I uncheck checkbox at index {int}",
  async function (this: ICustomWorld, index: number) {
    await (this.checkboxesPage as CheckboxesPage).setState(index, false);
  },
);

Then(
  "checkbox at index {int} should be checked",
  async function (this: ICustomWorld, index: number) {
    expect(await (this.checkboxesPage as CheckboxesPage).isChecked(index)).toBeTruthy();
  },
);

Then(
  "checkbox at index {int} should not be checked",
  async function (this: ICustomWorld, index: number) {
    expect(await (this.checkboxesPage as CheckboxesPage).isChecked(index)).toBeFalsy();
  },
);
