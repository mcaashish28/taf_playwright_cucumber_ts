import { Given, When, Then } from "@cucumber/cucumber";
import { expect } from "@playwright/test";
import { ICustomWorld } from "../../../support/custom-world";
import { NotificationPage } from "../../../pages/release1/module_4/notification.page";
import { getTestData } from "../../../utils/excel.helper";

Given("I open the Notification Message page", async function (this: ICustomWorld) {
  const page = new NotificationPage(this.page!);
  await page.open();
  this.notificationPage = page;
});

When("I trigger the notification", async function (this: ICustomWorld) {
  this.notificationText = await (this.notificationPage as NotificationPage).triggerNotification();
});

Then(
  "the notification should contain test data {string}",
  async function (this: ICustomWorld, key: string) {
    const expected = await getTestData(key);
    expect(this.notificationText).toContain(expected);
  },
);
