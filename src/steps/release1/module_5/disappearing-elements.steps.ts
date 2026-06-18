import { Given, Then } from "@cucumber/cucumber";
import { expect } from "@playwright/test";
import { ICustomWorld } from "../../../support/custom-world";
import { DisappearingElementsPage } from "../../../pages/release1/module_5/disappearing-elements.page";
import { getTestData } from "../../../utils/excel.helper";

Given("I open the Disappearing Elements page", async function (this: ICustomWorld) {
  const page = new DisappearingElementsPage(this.page!);
  await page.open();
  this.disappearingPage = page;
});

Then(
  "the menu should contain test data {string}",
  async function (this: ICustomWorld, key: string) {
    const expected = await getTestData(key);
    const present = await (this.disappearingPage as DisappearingElementsPage).isMenuItemPresent(
      expected,
    );
    expect(present).toBeTruthy();
  },
);
