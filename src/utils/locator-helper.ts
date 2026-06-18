import { Page, Locator } from "@playwright/test";

export type RoleName =
  | "alert"
  | "alertdialog"
  | "button"
  | "checkbox"
  | "combobox"
  | "dialog"
  | "heading"
  | "img"
  | "link"
  | "list"
  | "listitem"
  | "menu"
  | "menuitem"
  | "navigation"
  | "option"
  | "radio"
  | "row"
  | "searchbox"
  | "switch"
  | "tab"
  | "table"
  | "textbox";

export interface LocatorSpec {
  role?: { name: RoleName; text?: string | RegExp; exact?: boolean };
  testId?: string;
  label?: string | RegExp;
  placeholder?: string | RegExp;
  text?: string | RegExp;
  altText?: string | RegExp;
  title?: string | RegExp;
  css?: string;
  xpath?: string;
}

/**
 * Build a Locator from a declarative spec. Preference order matches
 * Playwright's recommended ladder: testId -> role -> label -> placeholder ->
 * text -> altText -> title -> css -> xpath.
 *
 * Page objects can store specs in a config file and resolve them at runtime,
 * which makes selectors editable without touching TypeScript.
 */
export function build(page: Page, spec: LocatorSpec): Locator {
  if (spec.testId) return page.getByTestId(spec.testId);
  if (spec.role)
    return page.getByRole(spec.role.name as any, {
      name: spec.role.text,
      exact: spec.role.exact,
    });
  if (spec.label) return page.getByLabel(spec.label);
  if (spec.placeholder) return page.getByPlaceholder(spec.placeholder);
  if (spec.text) return page.getByText(spec.text);
  if (spec.altText) return page.getByAltText(spec.altText);
  if (spec.title) return page.getByTitle(spec.title);
  if (spec.css) return page.locator(spec.css);
  if (spec.xpath) return page.locator(`xpath=${spec.xpath}`);
  throw new Error(`LocatorSpec is empty: ${JSON.stringify(spec)}`);
}

/**
 * Resolve many specs into a record of Locators. Useful in page-object
 * constructors:
 *
 *   this.locators = buildAll(page, {
 *     username: { css: '#username' },
 *     login:    { role: { name: 'button', text: 'Login' } },
 *   });
 */
export function buildAll<T extends Record<string, LocatorSpec>>(
  page: Page,
  specs: T,
): Record<keyof T, Locator> {
  const out: Record<string, Locator> = {};
  for (const key of Object.keys(specs)) out[key] = build(page, specs[key]);
  return out as Record<keyof T, Locator>;
}
