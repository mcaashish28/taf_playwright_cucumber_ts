import { Given, When, Then } from "@cucumber/cucumber";
import { expect } from "@playwright/test";
import { ICustomWorld } from "../../../support/custom-world";
import { SliderPage } from "../../../pages/release1/module_3/slider.page";
import { getTestData } from "../../../utils/excel.helper";

Given("I open the Horizontal Slider page", async function (this: ICustomWorld) {
  const page = new SliderPage(this.page!);
  await page.open();
  this.sliderPage = page;
});

When(
  "I set the slider to test data {string}",
  async function (this: ICustomWorld, key: string) {
    const value = await getTestData(key);
    await (this.sliderPage as SliderPage).setValue(value);
  },
);

Then(
  "the slider value should match test data {string}",
  async function (this: ICustomWorld, key: string) {
    const expected = await getTestData(key);
    const actual = await (this.sliderPage as SliderPage).getValue();
    expect(actual).toBe(expected);
  },
);
