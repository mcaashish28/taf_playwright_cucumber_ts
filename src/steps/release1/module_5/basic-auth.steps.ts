import { Given, Then } from "@cucumber/cucumber";
import { expect } from "@playwright/test";
import { ICustomWorld } from "../../../support/custom-world";
import { BasicAuthPage } from "../../../pages/release1/module_5/basic-auth.page";
import { getTestData } from "../../../utils/excel.helper";

Given(
  "I authenticate with basic auth using test data {string} and {string}",
  async function (this: ICustomWorld, userKey: string, passKey: string) {
    const user = await getTestData(userKey);
    const pass = await getTestData(passKey);
    const page = new BasicAuthPage(this.page!);
    await page.openWithCredentials(user, pass);
    this.basicAuthPage = page;
  },
);

Then(
  "the page content should contain test data {string}",
  async function (this: ICustomWorld, key: string) {
    const expected = await getTestData(key);
    const actual = await (this.basicAuthPage as BasicAuthPage).getContentText();
    expect(actual).toContain(expected);
  },
);
