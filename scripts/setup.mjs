#!/usr/bin/env node
// ============================================================================
// ONE-COMMAND PROJECT SETUP (Mac / Windows / Linux)
// ============================================================================
// Run:  npm run setup
//
// This installs:
//   1. All npm dependencies (from package.json)
//   2. Playwright browsers (chromium/firefox/webkit)
//   3. Required VS Code / Cursor extensions (listed below)
// ============================================================================

import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { platform } from 'node:os';

// --- Required editor extensions ---------------------------------------------
const EXTENSIONS = [
  'CucumberOpen.cucumber-official', // Gherkin highlight + step navigation
  'ms-playwright.playwright', // Playwright test runner UI
  'dbaeumer.vscode-eslint', // ESLint integration (used by `npm run lint`)
  'esbenp.prettier-vscode', // Prettier formatter (used by `npm run format`)
];

// --- Pretty logging ---------------------------------------------------------
const c = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
};
const step = (n, msg) => console.log(`\n${c.bold}${c.cyan}[${n}] ${msg}${c.reset}`);
const ok = (msg) => console.log(`  ${c.green}✔${c.reset} ${msg}`);
const warn = (msg) => console.log(`  ${c.yellow}⚠${c.reset} ${msg}`);
const fail = (msg) => console.log(`  ${c.red}✘${c.reset} ${msg}`);

const isWin = platform() === 'win32';

// --- Helpers ----------------------------------------------------------------
function run(cmd, args, { silent = false } = {}) {
  const result = spawnSync(cmd, args, {
    stdio: silent ? 'ignore' : 'inherit',
    shell: true,
  });
  return result.status === 0;
}

function commandExists(cmd) {
  const probe = isWin ? 'where' : 'which';
  return spawnSync(probe, [cmd], { stdio: 'ignore', shell: true }).status === 0;
}

function findEditorClis() {
  // Try PATH-based names first (works on Windows + Linux out of the box)
  const named = ['code', 'code-insiders', 'cursor'];
  const found = named.filter((n) => commandExists(n));

  // Mac fallback: the binaries inside the .app bundle (PATH usually not wired)
  if (!isWin) {
    const macPaths = [
      '/Applications/Visual Studio Code.app/Contents/Resources/app/bin/code',
      '/Applications/Visual Studio Code - Insiders.app/Contents/Resources/app/bin/code-insiders',
      '/Applications/Cursor.app/Contents/Resources/app/bin/cursor',
    ];
    for (const p of macPaths) if (existsSync(p)) found.push(p);
  }

  // Windows fallback: common install locations
  if (isWin) {
    const local = process.env.LOCALAPPDATA;
    const winPaths = [
      local && `${local}\\Programs\\Microsoft VS Code\\bin\\code.cmd`,
      local && `${local}\\Programs\\cursor\\resources\\app\\bin\\cursor.cmd`,
      'C:\\Program Files\\Microsoft VS Code\\bin\\code.cmd',
    ].filter(Boolean);
    for (const p of winPaths) if (existsSync(p)) found.push(p);
  }

  return [...new Set(found)];
}

// --- Main -------------------------------------------------------------------
console.log(`\n${c.bold}🚀 Playwright + Cucumber TS — Project Setup${c.reset}`);
console.log(`Platform: ${platform()} | Node: ${process.version}`);

// Step 1: npm install
step(1, 'Installing npm dependencies');
if (!run('npm', ['install'])) {
  fail('npm install failed — aborting');
  process.exit(1);
}
ok('npm dependencies installed');

// Step 2: Playwright browsers
step(2, 'Installing Playwright browsers (chromium, firefox, webkit)');
if (run('npx', ['playwright', 'install'])) {
  ok('Playwright browsers installed');
} else {
  warn('Playwright browser install failed (may already exist or restricted env)');
}

// Step 3: Editor extensions
step(3, 'Installing required VS Code / Cursor extensions');
const editors = findEditorClis();

if (editors.length === 0) {
  warn('No VS Code / Cursor CLI found on this machine.');
  console.log(`\n  Install these extensions manually from the marketplace:`);
  EXTENSIONS.forEach((e) => console.log(`    • ${e}`));
  console.log(
    `\n  ${c.cyan}Tip (Mac):${c.reset} Open VS Code → Cmd+Shift+P → "Shell Command: Install 'code' command in PATH"`,
  );
  console.log(`  ${c.cyan}Tip (Windows):${c.reset} The "code" command is usually on PATH after a default install.`);
} else {
  for (const cli of editors) {
    console.log(`\n  ${c.bold}→ Editor:${c.reset} ${cli}`);
    for (const ext of EXTENSIONS) {
      const success = run(`"${cli}"`, ['--install-extension', ext, '--force'], { silent: true });
      if (success) ok(ext);
      else fail(`${ext} (install failed — try manually)`);
    }
  }
}

// --- Done -------------------------------------------------------------------
console.log(`\n${c.bold}${c.green}✅ Setup complete.${c.reset}`);
console.log(`\nNext steps:`);
console.log(`  • Run tests:        ${c.cyan}npm test${c.reset}`);
console.log(`  • Open feature:     ${c.cyan}features/release1/module_1/module1_scenario_1.feature${c.reset}`);
console.log(`  • Reload editor:    Cmd/Ctrl + Shift + P → "Developer: Reload Window"\n`);
