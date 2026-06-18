# Playwright Cucumber TypeScript Automation Framework

A reusable, scalable BDD automation framework built with **Playwright**, **Cucumber**, and **TypeScript**, featuring CSV-driven test data, the Page Object Model, and an interactive custom HTML report with module-wise breakdown and root cause analysis.

The sample suite targets the public practice site **[the-internet.herokuapp.com](https://the-internet.herokuapp.com)** and ships **25 scenarios across 5 modules**.

---

## Highlights

- **Playwright** for fast, reliable cross-browser automation (Chromium / Firefox / WebKit)
- **Cucumber BDD** with Gherkin feature files, organized by release / module
- **TypeScript** for type safety
- **Page Object Model** for maintainable, reusable test code
- **CSV-driven test data** — scenarios read values from `qa_testdata.csv` via a generic data helper
- **Reusable utilities** — web actions, table reading, browser/window/download helpers, declarative locators
- **Interactive HTML Report** with module health, scenario filtering, and failure root cause analysis
- **One-command setup** (`npm run setup`) for Windows / macOS / Linux
- **GitHub Actions** workflow for running the regression suite in CI

---

## Sample Modules (the-internet.herokuapp.com)

| Module | Theme | Scenarios |
|--------|-------|-----------|
| **module_1** | Forms & basic interactions | Login (valid/invalid), checkboxes, dropdown, add/remove elements |
| **module_2** | Advanced interactions | Dynamic loading, JS alerts, hovers, iframe editor, key presses |
| **module_3** | Data tables, inputs, slider | Table lookup, sorting, row count, numeric input, horizontal slider |
| **module_4** | Files & windows | File upload, file download, multiple windows, nested frames, notifications |
| **module_5** | Dynamic & edge cases | Basic auth, dynamic controls, disappearing elements, broken images, infinite scroll |

> Note: 5 scenarios (one per module) currently assert intentionally-wrong values to demonstrate the report's failure handling. See [setup_guide.md](setup_guide.md) for how to revert them.

---

## Project Structure

```
taf_playwright_cucumber_ts/
├── .github/workflows/
│   └── regression.yml                       # CI workflow (manual trigger)
├── features/
│   └── release1/
│       ├── module_1/ … module_5/            # 5 .feature files per module
├── src/
│   ├── config/
│   │   ├── environment.ts                    # Env-based config (dotenv)
│   │   └── browser-options.ts
│   ├── steps/
│   │   └── release1/
│   │       ├── module_1/ … module_5/         # Step definitions by module
│   ├── pages/
│   │   ├── base.page.ts                       # BasePage (wraps WebActions)
│   │   └── release1/
│   │       ├── module_1/ … module_5/          # Page Object Model classes
│   ├── support/
│   │   ├── custom-world.ts                     # Cucumber World (shared state)
│   │   ├── common-hooks.ts                     # Before/After/BeforeAll hooks
│   │   └── reporters/
│   │       └── custom-reporter.ts              # Custom interactive HTML reporter
│   └── utils/
│       ├── web-actions.ts                      # Reusable browser actions
│       ├── table-helper.ts                     # HTML table reading helpers
│       ├── browser-helper.ts                   # Windows, downloads, images, scroll
│       ├── locator-helper.ts                   # Declarative locator builder
│       ├── excel.helper.ts                     # CSV/Excel test-data loader
│       ├── test-data.ts                        # JSON data + random generators
│       └── logger.ts                           # Winston logger
├── test-data/                                  # JSON data + sample upload file
├── qa_testdata.csv                             # Key/value test data (CSV)
├── reports/                                    # Generated reports (gitignored)
├── scripts/setup.mjs                           # One-command setup script
├── cucumber.mjs                                # Cucumber configuration (ESM)
├── tsconfig.json                               # TypeScript config
├── package.json
├── setup_guide.md                              # Full setup guide (Windows/Mac)
├── custom_report.md                            # Reporter integration guide
└── README.md
```

---

## Prerequisites

- **Node.js** >= 18 (LTS, e.g. 20.x recommended) — [nodejs.org](https://nodejs.org)
- **npm** >= 9 (bundled with Node)
- **Git** — [git-scm.com](https://git-scm.com)

Works on **Windows**, **macOS**, and **Linux**. See **[setup_guide.md](setup_guide.md)** for OS-specific install steps.

---

## Quick Start

```bash
# 1. Clone
git clone https://github.com/mcaashish28/taf_playwright_cucumber_ts.git
cd taf_playwright_cucumber_ts

# 2. One-command setup (deps + browsers + editor extensions)
npm run setup

# 3. Run the regression suite
npm run test:tags
```

Prefer manual setup? `npm install` → `npx playwright install` → `npm test`.

---

## Running Tests

```bash
# Run all scenarios
npm test

# Run @regression tagged scenarios (3 parallel workers)
npm run test:tags

# Run a specific module or tag
npx cucumber-js --tags "@module_1"
npx cucumber-js --tags "@regression and @module_3"

# Parallel execution (3 workers)
npm run test:parallel

# Dry run (validate step definitions without launching a browser)
npm run test:dry

# Generate HTML report from the latest JSON
npm run report
```

---

## Configuration

Configuration is read from environment variables (via a `.env` file locally, which is gitignored). Defaults live in [src/config/environment.ts](src/config/environment.ts).

| Variable   | Description                               | Default                              |
|-----------|-------------------------------------------|--------------------------------------|
| BASE_URL  | Target application URL                    | https://the-internet.herokuapp.com   |
| BROWSER   | Browser engine (chromium/firefox/webkit)  | chromium                             |
| HEADLESS  | Run in headless mode (true/false)         | true                                 |
| SLOW_MO   | Slow down actions in ms                   | 0                                    |
| TIMEOUT   | Default timeout in ms                     | 30000                                |
| ENV_NAME  | Environment name (shown in report)        | qa                                   |

Example `.env`:

```env
BASE_URL=https://the-internet.herokuapp.com
ENV_NAME=qa
BROWSER=chromium
HEADLESS=true
SLOW_MO=0
TIMEOUT=30000
```

---

## Test Data (CSV-driven)

Scenarios reference data by key, kept in [qa_testdata.csv](qa_testdata.csv):

```csv
key,value
validUser,tomsmith
validPassword,SuperSecretPassword!
dropdownOption,Option 1
...
```

Steps resolve values via `getTestData(key)` from [src/utils/excel.helper.ts](src/utils/excel.helper.ts), which auto-detects `<env>_testdata.csv` (e.g. `qa_testdata.csv`). An optional Excel loader (`xlsToMap`) is included for `.xlsx` sources.

---

## Reusable Utilities

| Utility | Purpose |
|---------|---------|
| [web-actions.ts](src/utils/web-actions.ts) | click, fill, hover, select, waits, checkboxes, drag/drop, upload, frames, dialogs, basic-auth header, assertions |
| [table-helper.ts](src/utils/table-helper.ts) | read HTML tables into rows/objects, find rows, column values, sort checks |
| [browser-helper.ts](src/utils/browser-helper.ts) | open new windows/tabs, download files, count broken images, scroll |
| [locator-helper.ts](src/utils/locator-helper.ts) | declarative locator builder (testId → role → label → text → css → xpath) |

---

## Reports

After a run, an interactive HTML report is auto-generated in `reports/` (e.g. `report_qa_18_06_2026_05_10_39_PM.html`).

| Tab | Description |
|-----|-------------|
| **Overview** | Summary cards (clickable), health bar, module health table |
| **Modules** | Module cards with pass/fail stats and scenario tables |
| **All Scenarios** | Filterable list with expandable step details and tags |
| **Failures** | Root cause analysis, failed step info, feature path + line number |

---

## Continuous Integration

A GitHub Actions workflow lives at [.github/workflows/regression.yml](.github/workflows/regression.yml):

- **Manual trigger** (`workflow_dispatch`) — run from the repo's **Actions** tab → **Regression Tests** → **Run workflow**. Push / PR / nightly triggers are included commented-out for later.
- Installs deps + Chromium, runs the `@regression` suite under `xvfb-run`, generates the HTML report, and uploads it (plus failure screenshots) as artifacts.

---

## Using the Reporter in Another Project

The custom reporter is portable — you mainly need [src/support/reporters/custom-reporter.ts](src/support/reporters/custom-reporter.ts) and [cucumber.mjs](cucumber.mjs). See **[custom_report.md](custom_report.md)** for details.

---

## Scripts Reference

| Script | Command | Description |
|--------|---------|-------------|
| `npm run setup` | `node scripts/setup.mjs` | Install deps + browsers + editor extensions |
| `npm test` | `cucumber-js` (+ report) | Run all scenarios |
| `npm run test:tags` | `cucumber-js --tags @regression --parallel 3` | Run regression tests |
| `npm run test:parallel` | `cucumber-js --parallel 3` | Parallel execution |
| `npm run test:dry` | `cucumber-js --dry-run` | Validate step definitions |
| `npm run report` | `ts-node src/support/reporters/custom-reporter.ts` | Generate HTML report |
| `npm run lint` | `eslint src/**/*.ts` | Lint TypeScript |
| `npm run format` | `prettier --write "src/**/*.ts"` | Format TypeScript |

---

## Documentation

| Document | Purpose |
|----------|---------|
| [setup_guide.md](setup_guide.md) | Full setup guide for Windows & macOS (prerequisites, install, configure, run, CI, troubleshooting) |
| [custom_report.md](custom_report.md) | How to integrate the reporter into other projects |
