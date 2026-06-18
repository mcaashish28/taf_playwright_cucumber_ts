import { Given, Then } from "@cucumber/cucumber";
import { expect } from "@playwright/test";
import { ICustomWorld } from "../../../support/custom-world";
import { BrokenImagesPage } from "../../../pages/release1/module_5/broken-images.page";
import { getTestData } from "../../../utils/excel.helper";

Given("I open the Broken Images page", async function (this: ICustomWorld) {
  const page = new BrokenImagesPage(this.page!);
  await page.open();
  this.brokenImagesPage = page;
});

Then(
  "the number of broken images should match test data {string}",
  async function (this: ICustomWorld, key: string) {
    const expected = parseInt(await getTestData(key), 10);
    const actual = await (this.brokenImagesPage as BrokenImagesPage).getBrokenImageCount();
    expect(actual).toBe(expected);
  },
);
