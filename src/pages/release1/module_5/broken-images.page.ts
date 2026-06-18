import { Page } from "@playwright/test";
import { BasePage } from "../../base.page";
import { ENV } from "../../../config/environment";
import { countBrokenImages } from "../../../utils/browser-helper";

/** the-internet /broken_images — page with a mix of valid and broken images. */
export class BrokenImagesPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async open(): Promise<void> {
    await this.navigate(`${ENV.BASE_URL}/broken_images`);
    // Give images time to attempt loading before counting failures
    await this.page.waitForLoadState("networkidle");
  }

  async getBrokenImageCount(): Promise<number> {
    return await countBrokenImages(this.page);
  }
}
