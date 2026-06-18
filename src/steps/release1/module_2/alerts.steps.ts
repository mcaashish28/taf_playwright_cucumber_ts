import { Given, When, Then } from "@cucumber/cucumber";
import { expect } from "@playwright/test";
import { ICustomWorld } from "../../../support/custom-world";
import { JsAlertsPage } from "../../../pages/release1/module_2/alerts.page";

Given("I open the JavaScript Alerts page", async function (this: ICustomWorld) {
  const page = new JsAlertsPage(this.page!);
  await page.open();
  this.alertsPage = page;
});

When("I accept the JS alert", async function (this: ICustomWorld) {
  await (this.alertsPage as JsAlertsPage).triggerAlert();
});

When("I dismiss the JS confirm", async function (this: ICustomWorld) {
  await (this.alertsPage as JsAlertsPage).triggerConfirm(false);
});

When(
  "I accept the JS prompt with {string}",
  async function (this: ICustomWorld, input: string) {
    await (this.alertsPage as JsAlertsPage).triggerPrompt(input);
  },
);

Then(
  "the alert result should contain {string}",
  async function (this: ICustomWorld, expected: string) {
    const actual = await (this.alertsPage as JsAlertsPage).getResult();
    expect(actual).toContain(expected);
  },
);
