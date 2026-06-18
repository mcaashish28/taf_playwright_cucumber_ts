import { Given, Then } from "@cucumber/cucumber";
import { expect } from "@playwright/test";
import { ICustomWorld } from "../../../support/custom-world";
import { NestedFramesPage } from "../../../pages/release1/module_4/nested-frames.page";
import { getTestData } from "../../../utils/excel.helper";

Given("I open the Nested Frames page", async function (this: ICustomWorld) {
  const page = new NestedFramesPage(this.page!);
  await page.open();
  this.nestedFramesPage = page;
});

Then(
  "the middle frame text should match test data {string}",
  async function (this: ICustomWorld, key: string) {
    const expected = await getTestData(key);
    const actual = await (this.nestedFramesPage as NestedFramesPage).getMiddleFrameText();
    expect(actual).toBe(expected);
  },
);
