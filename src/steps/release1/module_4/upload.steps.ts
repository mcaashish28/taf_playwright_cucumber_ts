import { Given, When, Then } from "@cucumber/cucumber";
import { expect } from "@playwright/test";
import * as path from "path";
import { ICustomWorld } from "../../../support/custom-world";
import { UploadPage } from "../../../pages/release1/module_4/upload.page";
import { getTestData } from "../../../utils/excel.helper";

Given("I open the File Upload page", async function (this: ICustomWorld) {
  const page = new UploadPage(this.page!);
  await page.open();
  this.uploadPage = page;
});

When(
  "I upload the file from test data {string}",
  async function (this: ICustomWorld, key: string) {
    const fileName = await getTestData(key);
    const filePath = path.resolve(process.cwd(), "test-data", fileName);
    await (this.uploadPage as UploadPage).uploadFile(filePath);
  },
);

Then(
  "the uploaded file name should match test data {string}",
  async function (this: ICustomWorld, key: string) {
    const expected = await getTestData(key);
    const actual = await (this.uploadPage as UploadPage).getUploadedFileName();
    expect(actual).toContain(expected);
  },
);
