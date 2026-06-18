import { BrowserContext, Page, Download } from "@playwright/test";
import * as path from "path";
import * as fs from "fs";
import { Logger } from "./logger";

/**
 * Generic helpers for browser-level concerns that span more than one page:
 * new tabs/windows, downloads, and image-health checks.
 */

/**
 * Run `action` (which is expected to open a new tab/window) and return the new
 * Page once it has finished loading. Works for target=_blank links and JS popups.
 */
export async function openNewPage(
  context: BrowserContext,
  action: () => Promise<void>,
): Promise<Page> {
  const [newPage] = await Promise.all([context.waitForEvent("page"), action()]);
  await newPage.waitForLoadState("domcontentloaded");
  Logger.info(`New page opened: ${newPage.url()}`);
  return newPage;
}

/**
 * Run `action` (which is expected to trigger a download) and save the file to
 * the given directory. Returns the suggested filename and the saved path.
 */
export async function downloadFile(
  page: Page,
  action: () => Promise<void>,
  saveDir = "test-results/downloads",
): Promise<{ fileName: string; savedPath: string }> {
  const [download] = (await Promise.all([
    page.waitForEvent("download"),
    action(),
  ])) as [Download, void];

  const fileName = download.suggestedFilename();
  const dir = path.resolve(process.cwd(), saveDir);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  const savedPath = path.join(dir, fileName);
  await download.saveAs(savedPath);
  Logger.info(`Downloaded file '${fileName}' to ${savedPath}`);
  return { fileName, savedPath };
}

/**
 * Count images on the page that failed to load (naturalWidth === 0).
 * Useful for "broken images" style checks.
 */
export async function countBrokenImages(page: Page): Promise<number> {
  return await page.evaluate(() => {
    const imgs = Array.from(document.querySelectorAll("img"));
    return imgs.filter((img) => !img.complete || img.naturalWidth === 0).length;
  });
}

/** Scroll to the bottom of the page `times` times, pausing between each scroll. */
export async function scrollToBottom(page: Page, times = 1, pauseMs = 500): Promise<void> {
  for (let i = 0; i < times; i++) {
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(pauseMs);
  }
}
