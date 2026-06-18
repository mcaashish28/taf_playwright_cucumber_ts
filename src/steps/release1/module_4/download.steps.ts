import { Given, When, Then } from "@cucumber/cucumber";
import { expect } from "@playwright/test";
import * as fs from "fs";
import { ICustomWorld } from "../../../support/custom-world";
import { DownloadPage } from "../../../pages/release1/module_4/download.page";

Given("I open the File Download page", async function (this: ICustomWorld) {
  const page = new DownloadPage(this.page!);
  await page.open();
  this.downloadPage = page;
});

When("I download the first available file", async function (this: ICustomWorld) {
  this.downloadResult = await (this.downloadPage as DownloadPage).downloadFirstFile();
});

Then("the downloaded file should exist on disk", async function (this: ICustomWorld) {
  const result = this.downloadResult as { fileName: string; savedPath: string };
  expect(result.fileName.length).toBeGreaterThan(0);
  expect(fs.existsSync(result.savedPath)).toBeTruthy();
  expect(fs.statSync(result.savedPath).size).toBeGreaterThan(0);
});
