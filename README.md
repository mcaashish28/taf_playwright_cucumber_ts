# Playwright Cucumber TypeScript Automation Framework

A BDD automation framework built with **Playwright**, **Cucumber**, and **TypeScript**, featuring an interactive custom HTML report with module-wise breakdown and root cause analysis.

---

## Highlights

- **Playwright** for fast, reliable browser automation
- **Cucumber BDD** with Gherkin feature files
- **TypeScript** for type safety
- **Page Object Model** for maintainable test code
- **Interactive HTML Report** with module health, scenario filtering, and failure root cause analysis
- **Portable Reporter** — drop into any Cucumber + TypeScript project

---

## Project Structure

```
playwright_cucumber_ts/
├── features/                              # Feature files organized by module
│   ├── module_1/
│   │   ├── module1_scenario_1.feature
│   │   └── module1_scenario_2.feature
│   └── module_2/
│       ├── module2_scenario_1.feature
│       └── module2_scenario_2.feature
├── src/
│   ├── config/                            # Configuration
│   │   ├── environment.ts
│   │   └── browser-options.ts
│   ├── steps/
│   │   └── step_definitions/              # Step definitions by module
│   │       ├── module_1/
│   │       └── module_2/
│   ├── pages/                             # Page Object Model
│   │   ├── base.page.ts
│   │   ├── installation.page.ts
│   │   └── writing-tests.page.ts
│   ├── support/
│   │   ├── custom-world.ts                # Cucumber World (shared state)
│   │   ├── hooks.ts                       # Before/After hooks
│   │   └── reporters/
│   │       └── custom-reporter.ts         # Custom interactive HTML reporter
│   └── utils/
│       ├── web-actions.ts                 # Browser action utilities
│       └── logger.ts                      # Winston logger
├── reports/                               # Generated reports (gitignored)
├── test-data/                             # Test data files
├── cucumber.mjs                           # Cucumber configuration (ESM)
├── tsconfig.json                          # TypeScript config
├── package.json                           # Dependencies & scripts
├── step_guide.md                          # Full setup guide
├── custom_report.md                       # Reporter integration guide
└── README.md
```

---

## Prerequisites

- **Node.js** >= 18
- **npm** >= 9

---

## Quick Start

```bash
# 1. Clone the repository
git clone <your-repo-url> playwright_cucumber_ts
cd playwright_cucumber_ts

# 2. Install dependencies
npm install

# 3. Install Playwright browsers
npx playwright install

# 4. Run regression tests
npm run test:tags
```

---

## Running Tests

```bash
# Run all tests (default profile)
npm test

# Run regression tagged tests
npm run test:tags

# Run with custom tag
npx cucumber-js --tags "@smoke"
npx cucumber-js --tags "@regression and @module_1"

# Run in parallel (2 workers)
npm run test:parallel

# Dry run (validate step definitions)
npm run test:dry

# Run tests + auto-generate HTML report
npm run test:report
```

---

## Reports

After test execution, an interactive HTML report is **auto-generated** in `reports/`:

```
reports/report_qa_29_05_2026_04_30_00_PM.html
```

To manually generate from existing JSON:
```bash
npm run report
```

### Report Features

| Tab | Description |
|-----|-------------|
| **Overview** | Summary cards (clickable), health bar, module health table |
| **Modules** | Module cards with pass/fail stats, detailed scenario tables |
| **All Scenarios** | Filterable list with expandable step details |
| **Failures** | Root cause analysis, failed step info, collapsible stack trace |

### Interactive Elements

- Click **summary cards** to filter scenarios by status (Passed/Failed/Skipped)
- Click **module names** to see only that module's details
- Click **failed scenarios** to jump directly to root cause analysis
- All navigation includes **"Show All"** reset buttons

---

## Configuration

Edit `.env` to configure:

| Variable   | Description                              | Default                       |
|-----------|------------------------------------------|-------------------------------|
| BASE_URL  | Target application URL                   | https://playwright.dev/python |
| BROWSER   | Browser engine (chromium/firefox/webkit)  | chromium                      |
| HEADLESS  | Run in headless mode (true/false)        | true                          |
| SLOW_MO   | Slow down actions in ms                  | 0                             |
| TIMEOUT   | Default timeout in ms                    | 30000                         |
| ENV_NAME  | Environment name (shown in report)       | qa                            |

---

## Adding New Tests

1. Create a module folder: `features/module_name/`
2. Add `.feature` files with `@regression` tag
3. Create step definitions: `src/steps/step_definitions/module_name/`
4. Create page objects: `src/pages/my-page.page.ts`

The reporter **auto-detects modules** from the folder structure under `features/`.

---

## Key Design Patterns

- **Page Object Model (POM)** — page interactions abstracted into classes
- **Custom World** — shared state (page, context) via Cucumber World
- **WebActions Utility** — reusable browser interaction methods
- **Environment Config** — `.env` based configuration via dotenv
- **Logger** — Winston-based structured logging
- **Auto Report** — HTML report generated automatically after test runs
- **Root Cause Analysis** — intelligent error parsing for stakeholder-friendly failure explanations

---

## Using the Reporter in Another Project

The custom reporter is designed to be **portable**. You only need 2 files:

1. `src/support/reporters/custom-reporter.ts`
2. `cucumber.mjs`

See **[custom_report.md](custom_report.md)** for detailed integration instructions.

---

## Documentation

| Document | Purpose |
|----------|---------|
| [step_guide.md](step_guide.md) | Full setup guide (clone, install, configure, customize) |
| [custom_report.md](custom_report.md) | How to integrate the reporter into other projects |

---

## Scripts Reference

| Script | Command | Description |
|--------|---------|-------------|
| `npm test` | `cucumber-js` | Run all tests |
| `npm run test:tags` | `cucumber-js --tags @regression` | Run regression tests |
| `npm run test:parallel` | `cucumber-js --parallel 2` | Parallel execution |
| `npm run test:dry` | `cucumber-js --dry-run` | Validate steps |
| `npm run report` | `ts-node src/support/reporters/custom-reporter.ts` | Generate HTML report |
| `npm run test:report` | Tests + report | Run tests and generate report |
