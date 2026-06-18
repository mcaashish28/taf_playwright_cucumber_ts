import { Given, When, Then } from "@cucumber/cucumber";
import { expect } from "@playwright/test";
import { ICustomWorld } from "../../../support/custom-world";
import { IframePage } from "../../../pages/release1/module_2/iframe.page";
import { getTestData } from "../../../utils/excel.helper";

Given("I open the iFrame page", async function (this: ICustomWorld) {
  const page = new IframePage(this.page!);
  await page.open();
  this.iframePage = page;
});

When(
  "I type test data {string} into the iframe editor",
  async function (this: ICustomWorld, key: string) {
    const text = await getTestData(key);
    await (this.iframePage as IframePage).typeIntoEditor(text);
  },
);

Then(
  "the iframe editor should contain test data {string}",
  async function (this: ICustomWorld, key: string) {
    const expected = await getTestData(key);
    const actual = await (this.iframePage as IframePage).getEditorText();
    expect(actual).toContain(expected);
  },
);
