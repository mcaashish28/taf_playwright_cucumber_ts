import { Given, When, Then } from "@cucumber/cucumber";
import { expect } from "@playwright/test";
import { ICustomWorld } from "../../../support/custom-world";
import { TablesPage } from "../../../pages/release1/module_3/tables.page";
import { getTestData } from "../../../utils/excel.helper";
import { isSortedAscending } from "../../../utils/table-helper";

Given("I open the Tables page", async function (this: ICustomWorld) {
  const page = new TablesPage(this.page!);
  await page.open();
  this.tablesPage = page;
});

When(
  "I look up the email for last name from test data {string}",
  async function (this: ICustomWorld, key: string) {
    const lastName = await getTestData(key);
    this.foundEmail = await (this.tablesPage as TablesPage).getEmailByLastName(lastName);
  },
);

Then(
  "the email should match test data {string}",
  async function (this: ICustomWorld, key: string) {
    const expected = await getTestData(key);
    expect(this.foundEmail).toBe(expected);
  },
);

When("I sort the table by last name", async function (this: ICustomWorld) {
  await (this.tablesPage as TablesPage).sortTable2ByLastName();
});

Then("the last name column should be sorted ascending", async function (this: ICustomWorld) {
  const lastNames = await (this.tablesPage as TablesPage).getTable2LastNames();
  expect(lastNames.length).toBeGreaterThan(0);
  expect(isSortedAscending(lastNames)).toBeTruthy();
});

Then(
  "the data table should have {int} rows",
  async function (this: ICustomWorld, expectedRows: number) {
    const lastNames = await (this.tablesPage as TablesPage).getTable2LastNames();
    expect(lastNames.length).toBe(expectedRows);
  },
);
