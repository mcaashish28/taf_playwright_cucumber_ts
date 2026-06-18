# Step-by-Step Setup Guide

## Prerequisites

- **Node.js** >= 18 (recommended: LTS version) — [nodejs.org](https://nodejs.org)
- **npm** >= 9 (bundled with Node.js)
- **Git** installed — [git-scm.com](https://git-scm.com)
- **VS Code** or **Cursor** editor — [code.visualstudio.com](https://code.visualstudio.com) / [cursor.sh](https://cursor.sh)

Works on **Windows**, **macOS**, and **Linux**.

---

## Quick Setup (One Command) — Recommended

After cloning the repo, run a single command to install everything:

```bash
git clone <your-repo-url> playwright_cucumber_ts
cd playwright_cucumber_ts
npm run setup
```

The `npm run setup` command runs [scripts/setup.mjs](scripts/setup.mjs) and does the following in order:

| Step | Action |
|------|--------|
| 1 | `npm install` — installs every dep from `package.json` (`@cucumber/cucumber`, `@playwright/test`, `ts-node`, `typescript`, `multiple-cucumber-html-reporter`, `dotenv`, `winston`) |
| 2 | `npx playwright install` — downloads Chromium, Firefox, and WebKit browsers |
| 3 | Auto-detects VS Code / Cursor and installs the required editor extensions |

### Editor extensions installed automatically

| Extension ID | Purpose |
|--------------|---------|
| `CucumberOpen.cucumber-official` | Gherkin syntax highlighting, step autocomplete, go-to-definition for `.feature` files |
| `ms-playwright.playwright` | Playwright test runner integration |
| `dbaeumer.vscode-eslint` | ESLint integration |
| `esbenp.prettier-vscode` | Prettier formatter |

### After setup

1. **Reload your editor**: `Cmd/Ctrl + Shift + P` → **"Developer: Reload Window"**.
2. Open a `.feature` file — keywords should be colorized and the bottom-right language indicator should show **"Cucumber"**.
3. Run `npm test` to verify the framework works end-to-end.

### Platform notes

- **Windows**: The `code` CLI is on PATH by default after a standard VS Code install — extensions install automatically.
- **macOS**: If `code` CLI isn't on PATH, the script falls back to `/Applications/Visual Studio Code.app/Contents/Resources/app/bin/code`. If you want `code` on PATH, run `Cmd+Shift+P` → **"Shell Command: Install 'code' command in PATH"** inside VS Code.
- **Linux**: The `code` CLI is on PATH by default after `apt`/`snap` install.

If no editor CLI is detected, the script prints the extension list so you can install them manually from the marketplace.

---

## Manual Setup (if you skipped Quick Setup)

### 1. Clone the Repository

```bash
git clone <your-repo-url> playwright_cucumber_ts
cd playwright_cucumber_ts
```

---

### 2. Install Dependencies

```bash
npm install
```

This installs:
- `@cucumber/cucumber` — BDD test runner
- `@playwright/test` — Browser automation
- `ts-node` — TypeScript execution
- `typescript` — TypeScript compiler
- `dotenv` — Environment configuration
- `winston` — Logging
- `multiple-cucumber-html-reporter` — HTML report generator

---

### 3. Install Playwright Browsers

```bash
npx playwright install
```

This downloads Chromium, Firefox, and WebKit browsers.

---

### 4. Install VS Code / Cursor Extensions

Install these from the marketplace, or via the CLI:

```bash
code --install-extension CucumberOpen.cucumber-official
code --install-extension ms-playwright.playwright
code --install-extension dbaeumer.vscode-eslint
code --install-extension esbenp.prettier-vscode
```

(For Cursor, replace `code` with `cursor`.)

---

## 5. Configure Environment

Edit the `.env` file in the project root:

```env
BASE_URL=https://your-application-url.com
BROWSER=chromium
HEADLESS=true
SLOW_MO=0
TIMEOUT=30000
ENV_NAME=qa
```

| Variable   | Description                          | Default                        |
|-----------|--------------------------------------|--------------------------------|
| BASE_URL  | Target application URL               | https://playwright.dev/python  |
| BROWSER   | Browser engine (chromium/firefox/webkit) | chromium                   |
| HEADLESS  | Run headless (true/false)            | true                           |
| SLOW_MO   | Slow down actions in ms              | 0                              |
| TIMEOUT   | Default timeout in ms                | 30000                          |
| ENV_NAME  | Environment name for reports         | qa                             |

---

## 6. Project Structure

```
playwright_cucumber_ts/
├── features/                          # Feature files organized by module
│   ├── module_1/
│   │   ├── module1_scenario_1.feature
│   │   └── module1_scenario_2.feature
│   └── module_2/
│       ├── module2_scenario_1.feature
│       └── module2_scenario_2.feature
├── src/
│   ├── config/
│   │   ├── environment.ts             # Environment variables
│   │   └── browser-options.ts         # Browser launch options
│   ├── steps/
│   │   └── step_definitions/          # Step definitions by module
│   │       ├── module_1/
│   │       └── module_2/
│   ├── pages/                         # Page Object Model classes
│   │   ├── base.page.ts
│   │   └── *.page.ts
│   ├── support/
│   │   ├── custom-world.ts            # Cucumber World (shared state)
│   │   ├── hooks.ts                   # Before/After hooks
│   │   └── reporters/
│   │       └── custom-reporter.ts     # Custom HTML report generator
│   └── utils/
│       ├── web-actions.ts             # Reusable browser utilities
│       └── logger.ts                  # Winston logger
├── reports/                           # Generated reports (gitignored)
├── cucumber.mjs                       # Cucumber configuration
├── tsconfig.json                      # TypeScript config
├── package.json                       # Dependencies & scripts
└── .env                               # Environment config
```

---

## 7. Customize for Your Project

### A. Add a New Module

1. Create a folder under `features/`:
   ```
   features/module_3/
   ```

2. Add `.feature` files with `@regression` tag:
   ```gherkin
   @regression
   Feature: My New Feature
     Scenario: My scenario
       Given I navigate to some page
       Then I should see something
   ```

3. Create step definitions:
   ```
   src/steps/step_definitions/module_3/my-steps.ts
   ```

4. Create page objects:
   ```
   src/pages/my-new.page.ts
   ```

### B. Modify Base URL

Update `src/config/environment.ts`:
```typescript
export const ENV = {
  BASE_URL: process.env.BASE_URL || "https://your-app.com",
  ENV_NAME: process.env.ENV_NAME || "qa",
};
```

### C. Add New Tags

Feature files support any tag:
```gherkin
@regression @smoke @module_3
Feature: My Feature
```

Run specific tags:
```bash
npx cucumber-js --tags "@smoke"
npx cucumber-js --tags "@regression and @module_3"
```

---

## 8. Running Tests

```bash
# Run all regression tests
npm run test:tags

# Run all tests (default profile)
npm test

# Run with custom tag
npx cucumber-js --tags "@smoke"

# Dry run (validate steps without executing)
npm run test:dry

# Run in parallel (2 workers)
npm run test:parallel
```

---

## 9. Generating Reports

Reports are auto-generated after test execution. You can also generate manually:

```bash
# Generate HTML report from latest JSON
npm run report

# Run tests + generate report
npm run test:report
```

Reports are saved to `reports/` with naming format:
```
report_<env>_<dd>_<mm>_<yyyy>_<hh>_<mm>_<ss>_<AM|PM>.html
```

Example: `report_qa_29_05_2026_04_30_00_PM.html`

---

## 10. Report Features

The custom HTML report includes:
- **Overview Tab**: Summary cards (Total, Passed, Failed, Skipped, Health %)
- **Modules Tab**: Module-wise breakdown with health indicators
- **All Scenarios Tab**: Filterable list of all scenarios with step details
- **Failures Tab**: Root cause analysis for each failure

All elements are interactive — click any card or status to navigate to details.

---

## 11. Troubleshooting

| Issue | Solution |
|-------|----------|
| `npm run setup` fails on Step 3 (extensions) | Ensure VS Code or Cursor is installed. On Mac, also run `Cmd+Shift+P` → **"Shell Command: Install 'code' command in PATH"** inside VS Code, then re-run `npm run setup`. |
| `.feature` file shows as **Plain Text** in the editor | Cucumber extension not installed or editor needs reload. Run `npm run setup` again, then `Cmd/Ctrl+Shift+P` → **"Developer: Reload Window"**. |
| Step definitions not found | Verify glob paths in `cucumber.mjs` match your folder structure |
| Browser not installed | Run `npx playwright install` |
| Timeout errors | Increase timeout in `.env` or `hooks.ts` |
| Report not generated | Ensure `reports/` directory exists and JSON report was created |
| TypeScript errors | Run `npx tsc --noEmit` to check for type issues |

---

## 12. CI/CD Integration

Add to your CI pipeline:

```yaml
steps:
  - name: Install dependencies
    run: npm ci

  - name: Install browsers
    run: npx playwright install --with-deps

  - name: Run tests
    run: npm run test:tags
    env:
      ENV_NAME: qa
      BASE_URL: https://your-app.com

  - name: Upload report
    uses: actions/upload-artifact@v3
    with:
      name: test-report
      path: reports/*.html
```
