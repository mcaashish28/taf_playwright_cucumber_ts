import { Page, FrameLocator } from "@playwright/test";
import { BasePage } from "../../base.page";
import { ENV } from "../../../config/environment";

export class IframePage extends BasePage {
  private readonly editorFrame: FrameLocator;

  constructor(page: Page) {
    super(page);
    this.editorFrame = page.frameLocator("#mce_0_ifr");
  }

  async open(): Promise<void> {
    await this.navigate(`${ENV.BASE_URL}/iframe`);
  }

  async typeIntoEditor(text: string): Promise<void> {
    const body = this.editorFrame.locator("body#tinymce");
    await body.waitFor({ state: "visible" });
    await body.evaluate((el, value) => {
      el.innerHTML = `<p>${value}</p>`;
    }, text);
  }

  async getEditorText(): Promise<string> {
    const body = this.editorFrame.locator("body#tinymce");
    return (await body.textContent())?.trim() || "";
  }
}
