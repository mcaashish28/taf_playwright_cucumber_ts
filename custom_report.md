# Custom Report Integration Guide

This guide explains how to take the custom HTML reporter from this project and integrate it into your own Playwright + Cucumber TypeScript project.

---

## Files You Need

You need **2 files** from this project:

| # | File | Path in This Project |
|---|------|---------------------|
| 1 | **Custom Reporter** | `src/support/reporters/custom-reporter.ts` |
| 2 | **Cucumber Config** | `cucumber.mjs` |

---

## Where to Place Them in Your Project

```
your-project/
├── cucumber.mjs                         ← Place here (root)
├── src/
│   └── support/
│       └── reporters/
│           └── custom-reporter.ts       ← Place here
├── reports/                             ← Create this folder
├── features/
│   ├── module_1/                        ← Organize features by module
│   └── module_2/
└── package.json
```

---

## Step-by-Step Integration

### Step 1: Copy the Reporter File

Copy `src/support/reporters/custom-reporter.ts` into your project at:
```
<your-project>/src/support/reporters/custom-reporter.ts
```

Create the directory if it doesn't exist:
```bash
mkdir -p src/support/reporters
cp <source>/src/support/reporters/custom-reporter.ts src/support/reporters/
```

### Step 2: Copy the Cucumber Config

Copy `cucumber.mjs` to your project root:
```bash
cp <source>/cucumber.mjs ./cucumber.mjs
```

### Step 3: Update cucumber.mjs Paths

Edit `cucumber.mjs` to match **your** project structure:

```javascript
const common = {
  requireModule: ["ts-node/register"],
  require: [
    "./src/steps/*.ts",                    // ← Adjust to your step definition paths
    "./src/steps/step_definitions/**/*.ts", // ← Adjust to your step definition paths
    "./src/support/custom-world.ts",       // ← Adjust to your world file path
    "./src/support/hooks.ts",              // ← Adjust to your hooks file path
  ],
  paths: ["./features/**/*.feature"],      // ← Adjust to your feature file paths
  publish: false,
  format: [
    "progress-bar",
    `json:reports/${reportName}.json`,     // ← Keep this - generates JSON for reporter
  ],
  formatOptions: { snippetInterface: "async-await" },
};
```

**Important**: The `json:reports/${reportName}.json` format line is critical — it generates the JSON file that the reporter reads.

### Step 4: Create Reports Directory

```bash
mkdir -p reports
```

Add to `.gitignore`:
```
reports/
```

### Step 5: Add Scripts to package.json

Add these scripts:
```json
{
  "scripts": {
    "report": "ts-node src/support/reporters/custom-reporter.ts",
    "test:report": "cucumber-js --tags @regression && ts-node src/support/reporters/custom-reporter.ts"
  }
}
```

### Step 6: Auto-Generate Report (Optional)

To auto-generate the report after tests, add this to your `hooks.ts` in the `AfterAll` hook:

```typescript
import { AfterAll } from "@cucumber/cucumber";

AfterAll(async function () {
  // ... your existing cleanup code ...

  // Auto-generate custom HTML report from JSON
  setTimeout(() => {
    try {
      const { generateReport } = require("./reporters/custom-reporter");
      generateReport();
    } catch (e) {
      console.warn("Could not auto-generate HTML report. Run 'npm run report' manually.");
    }
  }, 2000);
});
```

### Step 7: Set Environment Variable (Optional)

Set `ENV_NAME` to customize the report header:
```bash
ENV_NAME=staging npx cucumber-js --tags "@regression"
```

Or add to `.env`:
```env
ENV_NAME=qa
```

---

## How Module Detection Works

The reporter **auto-detects modules** from your feature file paths. It uses the folder structure:

```
features/
├── module_1/          → Report shows "Module 1"
├── module_2/          → Report shows "Module 2"
├── user_management/   → Report shows "User Management"
└── checkout/          → Report shows "Checkout"
```

**Naming convention**: Folder names are converted to title case with underscores replaced by spaces.

If features are NOT in subfolders, they are grouped under "General".

---

## Required Dependencies

Ensure these are in your `package.json`:

```json
{
  "devDependencies": {
    "@cucumber/cucumber": "^10.x",
    "ts-node": "^10.x",
    "typescript": "^5.x"
  }
}
```

The reporter uses **only Node.js built-in modules** (`fs`, `path`) — no additional dependencies required.

---

## Customization Options

### Change Report Styling

Edit the CSS section in `custom-reporter.ts` (search for `:root {`):
```css
:root {
  --primary: #1e293b;       /* Header background */
  --primary-light: #3b82f6; /* Accent color */
  --success: #27ae60;       /* Passed color */
  --danger: #e74c3c;        /* Failed color */
  --warning: #f39c12;       /* Warning color */
  --accent: #3498db;        /* Skipped/link color */
}
```

### Add Custom Root Cause Patterns

Edit the `extractRootCause()` function in `custom-reporter.ts` to add patterns specific to your application:

```typescript
// Add before the generic fallback
if (errorMessage.includes("your-specific-error")) {
  return "Custom root cause explanation for stakeholders.";
}
```

### Change Report File Name Format

Edit `getReportFileName()` in `cucumber.mjs`:
```javascript
// Current format: report_qa_29_05_2026_04_30_00_PM
// Modify as needed
return `report_${env}_${dd}_${mm}_${yyyy}_${hh}_${minutes}_${seconds}_${ampm}`;
```

---

## Verification Checklist

After integration, verify:

- [ ] `cucumber.mjs` paths match your project structure
- [ ] `reports/` directory exists
- [ ] Running tests generates a `.json` file in `reports/`
- [ ] `npm run report` generates an `.html` file in `reports/`
- [ ] Feature files are organized in module subfolders under `features/`
- [ ] HTML report opens in browser with correct module names
- [ ] Interactive elements (cards, links, filters) work correctly

---

## Troubleshooting

| Issue | Cause | Solution |
|-------|-------|----------|
| No HTML report generated | JSON file missing | Check `cucumber.mjs` has `json:reports/...` format |
| "No JSON report files found" | Reports dir empty | Run tests first: `npx cucumber-js` |
| Modules show as "General" | Features not in subfolders | Organize features: `features/module_name/*.feature` |
| Report shows 0 scenarios | JSON parse error | Check JSON file is valid: `cat reports/*.json` |
| TypeScript compilation error | Missing types | Run `npm install @types/node` |
