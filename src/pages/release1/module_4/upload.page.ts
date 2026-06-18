import { Page, Locator } from "@playwright/test";
import { BasePage } from "../../base.page";
import { ENV } from "../../../config/environment";

/** the-internet /upload — choose a file and submit. */
export class UploadPage extends BasePage {
  private readonly fileInput: Locator;
  private readonly submitButton: Locator;
  private readonly uploadedFiles: Locator;

  constructor(page: Page) {
    super(page);
    this.fileInput = page.locator("#file-upload");
    this.submitButton = page.locator("#file-submit");
    this.uploadedFiles = page.locator("#uploaded-files");
  }

  async open(): Promise<void> {
    await this.navigate(`${ENV.BASE_URL}/upload`);
  }

  async uploadFile(filePath: string): Promise<void> {
    await this.webActions.uploadFile(this.fileInput, filePath);
    await this.webActions.click(this.submitButton);
  }

  async getUploadedFileName(): Promise<string> {
    return await this.webActions.getText(this.uploadedFiles);
  }
}
