import { Given, When, Then } from "@cucumber/cucumber";
import { expect } from "@playwright/test";
import { ICustomWorld } from "../../../support/custom-world";
import { InfiniteScrollPage } from "../../../pages/release1/module_5/infinite-scroll.page";
import { getTestData } from "../../../utils/excel.helper";

Given("I open the Infinite Scroll page", async function (this: ICustomWorld) {
  const page = new InfiniteScrollPage(this.page!);
  await page.open();
  this.infiniteScrollPage = page;
});

When("I scroll down {int} times", async function (this: ICustomWorld, times: number) {
  await (this.infiniteScrollPage as InfiniteScrollPage).scrollDown(times);
});

Then(
  "the number of loaded paragraphs should be at least test data {string}",
  async function (this: ICustomWorld, key: string) {
    const minExpected = parseInt(await getTestData(key), 10);
    const actual = await (this.infiniteScrollPage as InfiniteScrollPage).getParagraphCount();
    expect(actual).toBeGreaterThanOrEqual(minExpected);
  },
);
