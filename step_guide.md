# Step-by-Step Setup Guide

## Prerequisites

- **Node.js** >= 18 (recommended: LTS version)
- **npm** >= 9
- **Git** installed
- A code editor (VS Code recommended)

---

## 1. Clone the Repository

```bash
git clone <your-repo-url> playwright_cucumber_ts
cd playwright_cucumber_ts
```

---

## 2. Install Dependencies

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

---

## 3. Install Playwright Browsers

```bash
npx playwright install
```

This downloads Chromium, Firefox, and WebKit browsers.

---

## 4. Configure Environment

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

## 5. Project Structure

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

## 6. Customize for Your Project

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

## 7. Running Tests

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

## 8. Generating Reports

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

## 9. Report Features

The custom HTML report includes:
- **Overview Tab**: Summary cards (Total, Passed, Failed, Skipped, Health %)
- **Modules Tab**: Module-wise breakdown with health indicators
- **All Scenarios Tab**: Filterable list of all scenarios with step details
- **Failures Tab**: Root cause analysis for each failure

All elements are interactive — click any card or status to navigate to details.

---

## 10. Troubleshooting

| Issue | Solution |
|-------|----------|
| Step definitions not found | Verify glob paths in `cucumber.mjs` match your folder structure |
| Browser not installed | Run `npx playwright install` |
| Timeout errors | Increase timeout in `.env` or `hooks.ts` |
| Report not generated | Ensure `reports/` directory exists and JSON report was created |
| TypeScript errors | Run `npx tsc --noEmit` to check for type issues |

---

## 11. CI/CD Integration

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
