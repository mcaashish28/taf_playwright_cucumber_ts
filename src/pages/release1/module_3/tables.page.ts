import { Page, Locator } from "@playwright/test";
import { BasePage } from "../../base.page";
import { ENV } from "../../../config/environment";
import { findRowByCell, getColumnValues } from "../../../utils/table-helper";

/** the-internet /tables — Example 1 is a plain table, Example 2 is sortable. */
export class TablesPage extends BasePage {
  private readonly table1: Locator;
  private readonly table2: Locator;
  // Column order: Last Name, First Name, Email, Due, Web Site, Action
  private static readonly COL_LAST_NAME = 0;
  private static readonly COL_EMAIL = 2;

  constructor(page: Page) {
    super(page);
    this.table1 = page.locator("#table1");
    this.table2 = page.locator("#table2");
  }

  async open(): Promise<void> {
    await this.navigate(`${ENV.BASE_URL}/tables`);
  }

  async getEmailByLastName(lastName: string): Promise<string | undefined> {
    const row = await findRowByCell(this.table1, TablesPage.COL_LAST_NAME, lastName);
    return row?.[TablesPage.COL_EMAIL];
  }

  async sortTable2ByLastName(): Promise<void> {
    const before = (await getColumnValues(this.table2, TablesPage.COL_LAST_NAME)).join("|");
    await this.table2.locator("thead th span.last-name").click();
    // Wait until the sort handler has actually reordered the rows
    await this.page
      .waitForFunction(
        (prev) => {
          const cells = Array.from(
            document.querySelectorAll("#table2 tbody tr td:first-child"),
          ).map((c) => (c.textContent || "").trim());
          return cells.join("|") !== prev;
        },
        before,
        { timeout: 5000 },
      )
      .catch(() => {
        /* order may already be ascending; assertion will validate */
      });
  }

  async getTable2LastNames(): Promise<string[]> {
    return await getColumnValues(this.table2, TablesPage.COL_LAST_NAME);
  }
}
