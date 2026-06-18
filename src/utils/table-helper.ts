import { Locator } from "@playwright/test";

/**
 * Generic helpers for reading HTML <table> elements into structured data.
 * Pass the <table> Locator (or any container holding thead/tbody rows).
 */

/** Read every body row as an array of cell-text arrays. */
export async function readRows(table: Locator): Promise<string[][]> {
  const rows = table.locator("tbody tr");
  const count = await rows.count();
  const out: string[][] = [];
  for (let i = 0; i < count; i++) {
    const cells = rows.nth(i).locator("td");
    const cellCount = await cells.count();
    const row: string[] = [];
    for (let c = 0; c < cellCount; c++) {
      row.push(((await cells.nth(c).textContent()) || "").trim());
    }
    out.push(row);
  }
  return out;
}

/** Read header labels from thead th cells. */
export async function readHeaders(table: Locator): Promise<string[]> {
  const headers = table.locator("thead th");
  const count = await headers.count();
  const out: string[] = [];
  for (let i = 0; i < count; i++) {
    out.push(((await headers.nth(i).textContent()) || "").trim());
  }
  return out;
}

/** Read the whole table as an array of {header: value} objects. */
export async function readAsObjects(table: Locator): Promise<Record<string, string>[]> {
  const headers = await readHeaders(table);
  const rows = await readRows(table);
  return rows.map((row) => {
    const obj: Record<string, string> = {};
    headers.forEach((h, i) => {
      obj[h || `col${i}`] = row[i] ?? "";
    });
    return obj;
  });
}

/**
 * Find the first row (as cell array) where the cell at columnIndex equals value.
 * Returns undefined when no row matches.
 */
export async function findRowByCell(
  table: Locator,
  columnIndex: number,
  value: string,
): Promise<string[] | undefined> {
  const rows = await readRows(table);
  return rows.find((row) => row[columnIndex] === value);
}

/** Return the values of a single column (by index) across all body rows. */
export async function getColumnValues(table: Locator, columnIndex: number): Promise<string[]> {
  const rows = await readRows(table);
  return rows.map((row) => row[columnIndex] ?? "");
}

/** True when the supplied string list is sorted ascending (case-insensitive). */
export function isSortedAscending(values: string[]): boolean {
  const lower = values.map((v) => v.toLowerCase());
  return lower.every((v, i) => i === 0 || lower[i - 1] <= v);
}
