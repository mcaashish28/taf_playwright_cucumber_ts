# Project Setup Guide (Windows & macOS)

Step-by-step instructions to set up and run this Playwright + Cucumber + TypeScript framework on a **new machine** — Windows or macOS. (Linux works too; commands match macOS unless noted.)

---

## 1. Install Prerequisites

You need **Node.js (>= 18, LTS recommended)**, **npm** (bundled with Node), and **Git**.

### Windows

Using [winget](https://learn.microsoft.com/windows/package-manager/winget/) (built into Windows 10/11):

```powershell
winget install OpenJS.NodeJS.LTS
winget install Git.Git
```

Or with [Chocolatey](https://chocolatey.org/):

```powershell
choco install nodejs-lts git -y
```

Or download installers: [Node.js](https://nodejs.org) · [Git for Windows](https://git-scm.com/download/win).

> After installing, **open a new terminal** (PowerShell or Git Bash) so PATH updates take effect.

### macOS

Using [Homebrew](https://brew.sh/):

```bash
brew install node git
```

Or download installers: [Node.js](https://nodejs.org) · [Git](https://git-scm.com/download/mac).

### Verify the installation (both OS)

```bash
node -v      # should be >= v18
npm -v       # should be >= 9
git --version
```

### Editor (recommended)

Install **VS Code** ([code.visualstudio.com](https://code.visualstudio.com)) or **Cursor** ([cursor.com](https://cursor.com)). The setup script auto-installs the required extensions.

---

## 2. Clone the Repository

```bash
git clone https://github.com/mcaashish28/taf_playwright_cucumber_ts.git
cd taf_playwright_cucumber_ts
```

---

## 3. One-Command Setup (Recommended)

```bash
npm run setup
```

This runs [scripts/setup.mjs](scripts/setup.mjs) and performs, in order:

| Step | Action |
|------|--------|
| 1 | `npm install` — installs all dependencies from `package.json` |
| 2 | `npx playwright install` — downloads Chromium, Firefox, and WebKit |
| 3 | Auto-detects VS Code / Cursor and installs the required editor extensions |

### Editor extensions installed automatically

| Extension ID | Purpose |
|--------------|---------|
| `CucumberOpen.cucumber-official` | Gherkin highlighting, step autocomplete, go-to-definition |
| `ms-playwright.playwright` | Playwright test integration |
| `dbaeumer.vscode-eslint` | ESLint integration (`npm run lint`) |
| `esbenp.prettier-vscode` | Prettier formatter (`npm run format`) |

#### Editor CLI notes

- **Windows:** the `code` command is on PATH after a standard VS Code install — extensions install automatically.
- **macOS:** if `code` isn't on PATH, the script falls back to the binary inside `/Applications/Visual Studio Code.app`. To add `code` to PATH, open VS Code → `Cmd+Shift+P` → **"Shell Command: Install 'code' command in PATH"**.

If no editor CLI is found, the script prints the extension list to install manually from the marketplace.

---

## 4. Manual Setup (if you skip Step 3)

```bash
# Install dependencies
npm install

# Install Playwright browsers
npx playwright install

# (optional) install editor extensions — replace "code" with "cursor" for Cursor
code --install-extension CucumberOpen.cucumber-official
code --install-extension ms-playwright.playwright
code --install-extension dbaeumer.vscode-eslint
code --install-extension esbenp.prettier-vscode
```

---

## 5. Configure Environment

Create a `.env` file in the project root (it is gitignored). Defaults live in [src/config/environment.ts](src/config/environment.ts), so this step is optional for the sample suite.

```env
BASE_URL=https://the-internet.herokuapp.com
ENV_NAME=qa
BROWSER=chromium
HEADLESS=true
SLOW_MO=0
TIMEOUT=30000
```

| Variable   | Description                               | Default                             |
|-----------|-------------------------------------------|-------------------------------------|
| BASE_URL  | Target application URL                     | https://the-internet.herokuapp.com  |
| BROWSER   | chromium / firefox / webkit                | chromium                            |
| HEADLESS  | Run headless (true/false)                  | true                                |
| SLOW_MO   | Slow down actions in ms                    | 0                                   |
| TIMEOUT   | Default timeout in ms                      | 30000                               |
| ENV_NAME  | Environment name (used in report names)    | qa                                  |

---

## 6. Verify the Setup

```bash
# Validate all step definitions resolve (no browser launch)
npm run test:dry

# Run the full suite
npm test
```

On Windows, run from **PowerShell** or **Git Bash**. If `npm test` opens browsers and passes/fails scenarios, your setup is working.

---

## 7. Running Tests

```bash
# All scenarios
npm test

# @regression scenarios, 3 parallel workers
npm run test:tags

# A specific module or tag combination
npx cucumber-js --tags "@module_1"
npx cucumber-js --tags "@regression and @module_3"

# Parallel execution (3 workers)
npm run test:parallel

# Dry run (validate steps only)
npm run test:dry
```

---

## 8. Test Data (CSV)

Scenarios read values by key from [qa_testdata.csv](qa_testdata.csv):

```csv
key,value
validUser,tomsmith
validPassword,SuperSecretPassword!
dropdownOption,Option 1
```

Steps call `getTestData("validUser")` from [src/utils/excel.helper.ts](src/utils/excel.helper.ts), which auto-detects `<ENV_NAME>_testdata.csv` (e.g. `qa_testdata.csv`). To add data, add a new `key,value` row and reference the key from a feature file.

---

## 9. Reports

An interactive HTML report is auto-generated in `reports/` after each run, named:

```
report_<env>_<dd>_<mm>_<yyyy>_<hh>_<mm>_<ss>_<AM|PM>.html
```

Generate manually from the latest JSON:

```bash
npm run report
```

The report has **Overview**, **Modules**, **All Scenarios**, and **Failures** (root cause) tabs.

---

## 10. Continuous Integration (GitHub Actions)

The workflow [.github/workflows/regression.yml](.github/workflows/regression.yml) runs the `@regression` suite in CI.

- **Trigger it manually:** repo → **Actions** tab → **Regression Tests** → **Run workflow** → choose `main`.
- It installs dependencies + Chromium, runs the suite under `xvfb-run` (virtual display for the browser), generates the HTML report, and uploads it (and failure screenshots) as **artifacts** — download them from the run's summary page.
- Push / PR / nightly auto-triggers are present but commented out in the `on:` block; uncomment to enable.

---

## 11. Customizing for Your Project

### Add a new scenario to an existing module

1. Add a `.feature` file under `features/release1/module_N/` with tags:
   ```gherkin
   @regression @module_1 @login
   Feature: My Feature
     Scenario: My scenario
       Given I open the Login page
       Then I should land on the Secure Area
   ```
2. Add step definitions under `src/steps/release1/module_N/`.
3. Add a page object under `src/pages/release1/module_N/` (extend `BasePage`).
4. Add any new data keys to `qa_testdata.csv`.

### Point at your own application

Set `BASE_URL` in `.env` (or update the default in [src/config/environment.ts](src/config/environment.ts)), then write page objects/steps for your app.

---

## 12. About the Sample Failures

5 scenarios (one per module) intentionally assert **wrong** expected values to demonstrate the report's failure handling. They reference `*Wrong` keys in [qa_testdata.csv](qa_testdata.csv).

**To make the suite fully green**, in each of these files restore the original key (drop the `Wrong` suffix), then delete the 5 `*Wrong` rows from `qa_testdata.csv`:

- `features/release1/module_1/module1_scenario_1.feature` → `loginSuccessMessageWrong` → `loginSuccessMessage`
- `features/release1/module_2/module2_scenario_5.feature` → `keyPressResultWrong` → `keyPressResult`
- `features/release1/module_3/module3_scenario_3.feature` → `inputNumberValueWrong` → `inputNumberValue`
- `features/release1/module_4/module4_scenario_3.feature` → `windowNewWindowTextWrong` → `windowNewWindowText`
- `features/release1/module_5/module5_scenario_4.feature` → `brokenImagesExpectedCountWrong` → `brokenImagesExpectedCount`

---

## 13. Troubleshooting

| Issue | Solution |
|-------|----------|
| `npm run setup` Step 3 fails (extensions) | Ensure VS Code/Cursor is installed. macOS: run `Cmd+Shift+P` → "Shell Command: Install 'code' command in PATH", then re-run. |
| `.feature` file shows as **Plain Text** | Install the Cucumber extension, then reload the editor (`Cmd/Ctrl+Shift+P` → "Developer: Reload Window"). |
| Browser not installed / launch fails locally | Run `npx playwright install` (or `npx playwright install --with-deps` on Linux). |
| CI fails with "launched a headed browser without XServer" | The workflow already wraps the run in `xvfb-run`; ensure you're using the provided `regression.yml`. |
| Step definitions "undefined" | Confirm the step text matches and files are under `src/steps/**`; a `/` in step text is treated as alternation by Cucumber — avoid or escape it. |
| Timeout errors | Increase `TIMEOUT` in `.env`. |
| TypeScript errors | Run `npx tsc --noEmit` to inspect; the `tsconfig.json` `lib` includes `DOM` for `page.evaluate` callbacks. |
| Report not generated | Ensure tests produced a JSON file in `reports/`; run `npm run report` manually. |

---

## Quick Reference

```bash
git clone https://github.com/mcaashish28/taf_playwright_cucumber_ts.git
cd taf_playwright_cucumber_ts
npm run setup          # install deps + browsers + extensions
npm test               # run all scenarios
npm run test:tags      # run @regression (parallel)
npm run report         # regenerate HTML report
```
