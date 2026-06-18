import { Given, When, Then } from "@cucumber/cucumber";
import { expect } from "@playwright/test";
import { ICustomWorld } from "../../../support/custom-world";
import { HoversPage } from "../../../pages/release1/module_2/hovers.page";
import { getTestData } from "../../../utils/excel.helper";

Given("I open the Hovers page", async function (this: ICustomWorld) {
  const page = new HoversPage(this.page!);
  await page.open();
  this.hoversPage = page;
  this.hoverIndex = 0;
});

When(
  "I hover over user from test data {string}",
  async function (this: ICustomWorld, key: string) {
    const index = parseInt(await getTestData(key), 10);
    this.hoverIndex = index;
    await (this.hoversPage as HoversPage).hoverUser(index);
  },
);

Then(
  "the caption should match test data {string}",
  async function (this: ICustomWorld, key: string) {
    const expected = await getTestData(key);
    const actual = await (this.hoversPage as HoversPage).getCaption(this.hoverIndex);
    expect(actual).toBe(expected);
  },
);
