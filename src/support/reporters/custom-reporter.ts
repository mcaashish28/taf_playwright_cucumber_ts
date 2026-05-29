// ============================================================================
// CUSTOM CUCUMBER REPORTER - Portable Module-Wise HTML Report Generator
// ============================================================================
// Generates a stakeholder-friendly HTML report with:
//   - Executive summary with pass/fail/health indicators
//   - Module-wise breakdown (auto-detected from feature file paths)
//   - Detailed scenario & step results per module
//   - Failures tab with error details
//   - Report naming: report_<env>_<dd>_<mm>_<yyyy>_<hh>_<mm>_<ss>_<AM|PM>.html
//
// Usage:
//   1. Drop this file into: src/support/reporters/custom-reporter.ts
//   2. Run after tests: ts-node src/support/reporters/custom-reporter.ts
//   3. Or call generateReport() from AfterAll hook
// ============================================================================

import * as fs from "fs";
import * as path from "path";

// --- Interfaces ---

interface StepResult {
  name: string;
  keyword: string;
  status: string;
  duration: number;
  errorMessage?: string;
}

interface ScenarioResult {
  feature: string;
  featureUri: string;
  module: string;
  scenario: string;
  status: string;
  duration: number;
  steps: StepResult[];
  tags: string[];
}

interface ModuleSummary {
  name: string;
  features: string[];
  totalScenarios: number;
  passed: number;
  failed: number;
  skipped: number;
  duration: number;
  healthPercent: number;
}

// --- Utility Functions ---

function getReportFileName(): string {
  const env = process.env.ENV_NAME || "qa";
  const now = new Date();
  const dd = String(now.getDate()).padStart(2, "0");
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const yyyy = now.getFullYear();
  let hours = now.getHours();
  const minutes = String(now.getMinutes()).padStart(2, "0");
  const seconds = String(now.getSeconds()).padStart(2, "0");
  const ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12 || 12;
  const hh = String(hours).padStart(2, "0");
  return `report_${env}_${dd}_${mm}_${yyyy}_${hh}_${minutes}_${seconds}_${ampm}`;
}

function extractModuleName(uri: string): string {
  // Auto-detect module from path: features/module_1/file.feature -> Module 1
  const parts = uri.replace(/\\/g, "/").split("/");
  const featuresIdx = parts.findIndex((p) => p === "features");
  if (featuresIdx >= 0 && featuresIdx + 1 < parts.length) {
    const modulePart = parts[featuresIdx + 1];
    // Convert module_1 -> Module 1, login -> Login, etc.
    return modulePart
      .replace(/_/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase());
  }
  return "Default";
}

function formatDuration(nanos: number): string {
  const ms = nanos / 1_000_000;
  if (ms < 1000) return `${ms.toFixed(0)}ms`;
  const seconds = ms / 1000;
  if (seconds < 60) return `${seconds.toFixed(1)}s`;
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = (seconds % 60).toFixed(0);
  return `${minutes}m ${remainingSeconds}s`;
}

function getHealthColor(percent: number): string {
  if (percent >= 90) return "#27ae60";
  if (percent >= 70) return "#f39c12";
  if (percent >= 50) return "#e67e22";
  return "#e74c3c";
}

function getHealthLabel(percent: number): string {
  if (percent >= 90) return "Healthy";
  if (percent >= 70) return "Needs Attention";
  if (percent >= 50) return "At Risk";
  return "Critical";
}

function getStatusIcon(status: string): string {
  switch (status) {
    case "passed": return "&#10004;";
    case "failed": return "&#10008;";
    case "skipped": return "&#8722;";
    default: return "&#63;";
  }
}

function extractRootCause(errorMessage: string): string {
  if (!errorMessage) return "Unknown failure - no error details captured.";

  // Assertion failures (expect)
  const expectMatch = errorMessage.match(/expect\((.+?)\)\.([\w]+)\((.+?)\)/);
  if (expectMatch) {
    const [, received, matcher, expected] = expectMatch;
    if (matcher === "toContain") return `Expected value to contain ${expected}, but it was not found in the actual result.`;
    if (matcher === "toBeTruthy") return `Expected a truthy value but received a falsy one. The element or condition was not met.`;
    if (matcher === "toBe") return `Expected ${expected} but received a different value.`;
    if (matcher === "toEqual") return `Expected value to equal ${expected} but the actual value did not match.`;
    return `Assertion failed: expected ${matcher} condition was not satisfied.`;
  }

  // Playwright timeout
  if (errorMessage.includes("Timeout") || errorMessage.includes("exceeded") || errorMessage.includes("timed out")) {
    return "Element not found or action timed out. The page may not have loaded correctly, or the element locator is incorrect.";
  }

  // Element not visible/found
  if (errorMessage.includes("not visible") || errorMessage.includes("not attached") || errorMessage.includes("not found")) {
    return "Target element was not visible or not present in the DOM. The page structure may have changed or the element has not rendered.";
  }

  // Navigation errors
  if (errorMessage.includes("ERR_NAME_NOT_RESOLVED") || errorMessage.includes("ERR_CONNECTION") || errorMessage.includes("net::")) {
    return "Network/navigation error. The target URL may be unreachable or the server is down.";
  }

  // Strict mode violation
  if (errorMessage.includes("strict mode violation") || errorMessage.includes("resolved to")) {
    return "Multiple elements matched the locator. The selector is not specific enough and needs to be refined.";
  }

  // Generic - extract first meaningful line
  const lines = errorMessage.split("\n").filter((l) => l.trim() && !l.trim().startsWith("at "));
  const firstMeaningful = lines.find((l) => l.includes("Error") || l.includes("expect") || l.includes("assert")) || lines[0];
  return firstMeaningful?.trim() || "An unexpected error occurred during test execution.";
}

function getStatusColor(status: string): string {
  switch (status) {
    case "passed": return "#27ae60";
    case "failed": return "#e74c3c";
    case "skipped": return "#3498db";
    case "pending": return "#f39c12";
    case "undefined": return "#95a5a6";
    default: return "#bdc3c7";
  }
}

// --- JSON Parser ---

function parseJsonReport(jsonFilePath: string): ScenarioResult[] {
  const results: ScenarioResult[] = [];
  if (!fs.existsSync(jsonFilePath)) return results;

  const raw = JSON.parse(fs.readFileSync(jsonFilePath, "utf-8"));
  for (const feature of raw) {
    const featureName = feature.name || "Unknown Feature";
    const featureUri = feature.uri || "";
    const moduleName = extractModuleName(featureUri);
    const featureTags = (feature.tags || []).map((t: any) => t.name);

    for (const element of feature.elements || []) {
      if (element.type !== "scenario") continue;
      const steps: StepResult[] = [];
      let scenarioStatus = "passed";
      let totalDuration = 0;

      for (const step of element.steps || []) {
        const stepStatus = step.result?.status || "undefined";
        const stepDuration = step.result?.duration || 0;
        totalDuration += stepDuration;
        steps.push({
          name: step.name || "",
          keyword: (step.keyword || "").trim(),
          status: stepStatus,
          duration: stepDuration,
          errorMessage: step.result?.error_message,
        });
        if (stepStatus === "failed") scenarioStatus = "failed";
        else if (stepStatus === "skipped" && scenarioStatus !== "failed") scenarioStatus = "skipped";
        else if (stepStatus === "pending" && scenarioStatus === "passed") scenarioStatus = "pending";
        else if (stepStatus === "undefined" && scenarioStatus === "passed") scenarioStatus = "undefined";
      }

      const scenarioTags = (element.tags || []).map((t: any) => t.name);
      results.push({
        feature: featureName,
        featureUri,
        module: moduleName,
        scenario: element.name || "Unknown Scenario",
        status: scenarioStatus,
        duration: totalDuration,
        steps,
        tags: [...new Set([...featureTags, ...scenarioTags])],
      });
    }
  }
  return results;
}

// --- Module Summary Builder ---

function buildModuleSummaries(results: ScenarioResult[]): ModuleSummary[] {
  const moduleMap = new Map<string, ModuleSummary>();

  for (const r of results) {
    if (!moduleMap.has(r.module)) {
      moduleMap.set(r.module, {
        name: r.module,
        features: [],
        totalScenarios: 0,
        passed: 0,
        failed: 0,
        skipped: 0,
        duration: 0,
        healthPercent: 0,
      });
    }
    const m = moduleMap.get(r.module)!;
    m.totalScenarios++;
    m.duration += r.duration;
    if (!m.features.includes(r.feature)) m.features.push(r.feature);
    if (r.status === "passed") m.passed++;
    else if (r.status === "failed") m.failed++;
    else m.skipped++;
  }

  // Calculate health percentage
  for (const m of moduleMap.values()) {
    m.healthPercent = m.totalScenarios > 0 ? Math.round((m.passed / m.totalScenarios) * 100) : 0;
  }

  return Array.from(moduleMap.values()).sort((a, b) => a.name.localeCompare(b.name));
}

// --- HTML Report Generator ---

function generateHtmlReport(results: ScenarioResult[], reportFilePath: string, env: string): void {
  const modules = buildModuleSummaries(results);
  const totalScenarios = results.length;
  const totalPassed = results.filter((r) => r.status === "passed").length;
  const totalFailed = results.filter((r) => r.status === "failed").length;
  const totalSkipped = totalScenarios - totalPassed - totalFailed;
  const overallHealth = totalScenarios > 0 ? Math.round((totalPassed / totalScenarios) * 100) : 0;
  const totalDuration = results.reduce((sum, r) => sum + r.duration, 0);
  const now = new Date();
  const reportTime = now.toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "medium" });
  const failedResults = results.filter((r) => r.status === "failed");

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>QA Test Report - ${env.toUpperCase()} Environment</title>
  <style>
    :root {
      --primary: #1a2332;
      --primary-light: #2c3e50;
      --accent: #3498db;
      --success: #27ae60;
      --danger: #e74c3c;
      --warning: #f39c12;
      --muted: #95a5a6;
      --bg: #f0f2f5;
      --card-bg: #ffffff;
      --border: #e8ecf0;
      --text: #2c3e50;
      --text-muted: #7f8c8d;
    }
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: var(--bg); color: var(--text); line-height: 1.6; }

    /* Header */
    .header { background: linear-gradient(135deg, var(--primary) 0%, var(--primary-light) 100%); color: #fff; padding: 20px 32px; }
    .header-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
    .header h1 { font-size: 22px; font-weight: 700; letter-spacing: -0.5px; }
    .header-meta { display: flex; gap: 16px; align-items: center; }
    .env-badge { background: var(--danger); padding: 5px 14px; border-radius: 4px; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; }
    .time-badge { font-size: 12px; opacity: 0.8; }
    .header-subtitle { font-size: 13px; opacity: 0.7; }

    /* Navigation */
    .nav { background: var(--primary-light); border-bottom: 1px solid rgba(255,255,255,0.1); display: flex; padding: 0 32px; }
    .nav-btn { background: none; border: none; color: rgba(255,255,255,0.6); padding: 14px 20px; cursor: pointer; font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 3px solid transparent; transition: all 0.2s; }
    .nav-btn:hover { color: #fff; background: rgba(255,255,255,0.05); }
    .nav-btn.active { color: #fff; border-bottom-color: var(--accent); }

    /* Content */
    .content { max-width: 1400px; margin: 0 auto; padding: 24px 32px; }
    .tab-panel { display: none; }
    .tab-panel.active { display: block; }

    /* Summary Cards */
    .summary-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; margin-bottom: 28px; }
    .summary-card { background: var(--card-bg); border-radius: 12px; padding: 24px; box-shadow: 0 1px 3px rgba(0,0,0,0.06); border: 1px solid var(--border); position: relative; overflow: hidden; }
    .summary-card::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 4px; }
    .summary-card.total::before { background: var(--primary-light); }
    .summary-card.passed::before { background: var(--success); }
    .summary-card.failed::before { background: var(--danger); }
    .summary-card.skipped::before { background: var(--accent); }
    .summary-card.health::before { background: var(--warning); }
    .summary-card .value { font-size: 32px; font-weight: 800; margin-bottom: 4px; }
    .summary-card .label { font-size: 12px; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600; }
    .summary-card.total .value { color: var(--primary-light); }
    .summary-card.passed .value { color: var(--success); }
    .summary-card.failed .value { color: var(--danger); }
    .summary-card.skipped .value { color: var(--accent); }
    .summary-card.clickable { cursor: pointer; transition: transform 0.2s, box-shadow 0.2s; }
    .summary-card.clickable:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,0.15); }
    .summary-card.clickable.failed:hover { box-shadow: 0 4px 12px rgba(231,76,60,0.25); }
    .summary-card.clickable.passed:hover { box-shadow: 0 4px 12px rgba(39,174,96,0.25); }
    .summary-card.clickable.health:hover { box-shadow: 0 4px 12px rgba(243,156,18,0.25); }
    .module-row { cursor: pointer; transition: background 0.2s; }
    .module-row:hover td { background: #f0f7ff !important; }

    /* Health Bar */
    .health-bar-container { margin-bottom: 28px; background: var(--card-bg); border-radius: 12px; padding: 20px 24px; box-shadow: 0 1px 3px rgba(0,0,0,0.06); border: 1px solid var(--border); }
    .health-bar-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
    .health-bar-title { font-size: 14px; font-weight: 600; }
    .health-bar-percent { font-size: 14px; font-weight: 700; }
    .health-bar { height: 12px; border-radius: 6px; background: #ecf0f1; overflow: hidden; display: flex; }
    .health-bar .segment { height: 100%; transition: width 0.3s; }
    .health-bar .passed-seg { background: var(--success); }
    .health-bar .failed-seg { background: var(--danger); }
    .health-bar .skipped-seg { background: var(--accent); }
    .health-bar-legend { display: flex; gap: 20px; margin-top: 10px; font-size: 12px; color: var(--text-muted); }
    .legend-dot { width: 10px; height: 10px; border-radius: 50%; display: inline-block; margin-right: 6px; vertical-align: middle; }

    /* Module Cards */
    .module-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(380px, 1fr)); gap: 20px; margin-bottom: 28px; }
    .module-card { background: var(--card-bg); border-radius: 12px; box-shadow: 0 1px 3px rgba(0,0,0,0.06); border: 1px solid var(--border); overflow: hidden; transition: transform 0.2s, box-shadow 0.2s; }
    .module-card:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
    .module-card-header { padding: 18px 20px; border-bottom: 1px solid var(--border); display: flex; justify-content: space-between; align-items: center; }
    .module-card-header h3 { font-size: 15px; font-weight: 700; }
    .module-health-badge { padding: 4px 12px; border-radius: 20px; font-size: 11px; font-weight: 700; color: #fff; }
    .module-card-body { padding: 16px 20px; }
    .module-stats { display: flex; gap: 16px; margin-bottom: 14px; }
    .module-stat { text-align: center; flex: 1; }
    .module-stat .num { font-size: 20px; font-weight: 700; }
    .module-stat .lbl { font-size: 11px; color: var(--text-muted); text-transform: uppercase; }
    .module-bar { height: 8px; border-radius: 4px; background: #ecf0f1; overflow: hidden; display: flex; margin-bottom: 12px; }
    .module-features { font-size: 12px; color: var(--text-muted); }
    .module-features strong { color: var(--text); }

    /* Tables */
    .data-table { width: 100%; border-collapse: collapse; background: var(--card-bg); border-radius: 12px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.06); border: 1px solid var(--border); margin-bottom: 20px; }
    .data-table th { background: var(--primary-light); color: #fff; padding: 14px 16px; text-align: left; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600; }
    .data-table td { padding: 12px 16px; border-bottom: 1px solid var(--border); font-size: 13px; }
    .data-table tr:last-child td { border-bottom: none; }
    .data-table tr:hover td { background: #f8fafe; }

    /* Status Badges */
    .status-badge { display: inline-flex; align-items: center; gap: 4px; padding: 3px 10px; border-radius: 4px; font-size: 11px; font-weight: 700; text-transform: uppercase; }
    .status-badge.passed { background: #e8f8ef; color: var(--success); }
    .status-badge.failed { background: #fde8e8; color: var(--danger); }
    .status-badge.skipped { background: #e8f4fd; color: var(--accent); }
    .status-badge.undefined { background: #f5f5f5; color: var(--muted); }
    .status-badge.pending { background: #fef9e7; color: var(--warning); }

    /* Scenario Details */
    .scenario-row { cursor: pointer; }
    .scenario-row:hover td { background: #f0f7ff !important; }
    .step-details { display: none; }
    .step-details td { padding: 0; }
    .step-list { padding: 12px 20px; background: #fafbfc; }
    .step-item { display: flex; align-items: center; gap: 10px; padding: 6px 0; font-size: 12px; border-bottom: 1px solid #f0f0f0; }
    .step-item:last-child { border-bottom: none; }
    .step-keyword { color: #8e44ad; font-weight: 700; min-width: 60px; }
    .step-name { flex: 1; }
    .step-duration { color: var(--text-muted); min-width: 60px; text-align: right; }
    .error-block { background: #fdf2f2; border: 1px solid #fce4e4; border-radius: 6px; padding: 10px 14px; margin-top: 8px; font-size: 11px; color: #c0392b; white-space: pre-wrap; word-break: break-word; max-height: 120px; overflow: auto; font-family: 'SF Mono', Monaco, monospace; }

    /* Empty State */
    .empty-state { text-align: center; padding: 48px 24px; }
    .empty-state .icon { font-size: 48px; margin-bottom: 12px; }
    .empty-state .msg { font-size: 16px; color: var(--text-muted); }

    /* Footer */
    .footer { text-align: center; padding: 20px; color: var(--text-muted); font-size: 11px; margin-top: 32px; border-top: 1px solid var(--border); }

    /* Responsive */
    @media (max-width: 768px) {
      .content { padding: 16px; }
      .module-grid { grid-template-columns: 1fr; }
      .summary-grid { grid-template-columns: repeat(2, 1fr); }
    }
  </style>
</head>
<body>
  <div class="header">
    <div class="header-top">
      <h1>QA Automation Test Report</h1>
      <div class="header-meta">
        <span class="env-badge">${env.toUpperCase()} Environment</span>
        <span class="time-badge">${reportTime}</span>
      </div>
    </div>
    <div class="header-subtitle">Execution Duration: ${formatDuration(totalDuration)} | ${totalScenarios} Scenarios across ${modules.length} Module(s)</div>
  </div>

  <div class="nav">
    <button class="nav-btn active" onclick="showTab(this, 'overview')">Overview</button>
    <button class="nav-btn" onclick="showTab(this, 'modules')">Modules</button>
    <button class="nav-btn" onclick="showTab(this, 'scenarios')">All Scenarios</button>
    <button class="nav-btn" onclick="showTab(this, 'failures')">Failures (${totalFailed})</button>
  </div>

  <div class="content">

    <!-- OVERVIEW TAB -->
    <div id="overview" class="tab-panel active">
      <div class="summary-grid">
        <div class="summary-card total clickable" onclick="filterScenarios('all')"><div class="value">${totalScenarios}</div><div class="label">Total Scenarios &#8599;</div></div>
        <div class="summary-card passed clickable" onclick="filterScenarios('passed')"><div class="value">${totalPassed}</div><div class="label">Passed &#8599;</div></div>
        <div class="summary-card failed clickable" onclick="filterScenarios('failed')"><div class="value">${totalFailed}</div><div class="label">Failed &#8599;</div></div>
        <div class="summary-card skipped clickable" onclick="filterScenarios('skipped')"><div class="value">${totalSkipped}</div><div class="label">Skipped &#8599;</div></div>
        <div class="summary-card health clickable" onclick="navigateToTab('modules')"><div class="value" style="color:${getHealthColor(overallHealth)}">${overallHealth}%</div><div class="label">Overall Health &#8599;</div></div>
      </div>

      <div class="health-bar-container">
        <div class="health-bar-header">
          <span class="health-bar-title">Execution Summary</span>
          <span class="health-bar-percent" style="color:${getHealthColor(overallHealth)}">${overallHealth}% Pass Rate</span>
        </div>
        <div class="health-bar">
          <div class="segment passed-seg" style="width:${totalScenarios > 0 ? (totalPassed / totalScenarios) * 100 : 0}%"></div>
          <div class="segment failed-seg" style="width:${totalScenarios > 0 ? (totalFailed / totalScenarios) * 100 : 0}%"></div>
          <div class="segment skipped-seg" style="width:${totalScenarios > 0 ? (totalSkipped / totalScenarios) * 100 : 0}%"></div>
        </div>
        <div class="health-bar-legend">
          <span><span class="legend-dot" style="background:var(--success)"></span>Passed (${totalPassed})</span>
          <span><span class="legend-dot" style="background:var(--danger)"></span>Failed (${totalFailed})</span>
          <span><span class="legend-dot" style="background:var(--accent)"></span>Skipped (${totalSkipped})</span>
        </div>
      </div>

      <h2 style="font-size:16px;margin-bottom:16px;font-weight:700;">Module Health Summary</h2>
      <table class="data-table">
        <tr>
          <th>Module</th>
          <th>Features</th>
          <th>Scenarios</th>
          <th>Passed</th>
          <th>Failed</th>
          <th>Skipped</th>
          <th>Duration</th>
          <th>Health</th>
          <th>Status</th>
        </tr>
        ${modules.map((m, mIdx) => `
        <tr class="module-row" onclick="navigateToModule('${m.name}')">
          <td><strong style="color:var(--accent);">${m.name} &#8599;</strong></td>
          <td>${m.features.length}</td>
          <td>${m.totalScenarios}</td>
          <td style="color:var(--success);font-weight:600;">${m.passed}</td>
          <td style="color:${m.failed > 0 ? 'var(--danger)' : 'inherit'};font-weight:${m.failed > 0 ? '600' : '400'};${m.failed > 0 ? 'cursor:pointer;text-decoration:underline;' : ''}" ${m.failed > 0 ? `onclick="event.stopPropagation();navigateToTab('failures')"` : ''}>${m.failed}</td>
          <td>${m.skipped}</td>
          <td>${formatDuration(m.duration)}</td>
          <td>
            <div style="display:flex;align-items:center;gap:8px;">
              <div style="flex:1;height:6px;border-radius:3px;background:#ecf0f1;overflow:hidden;">
                <div style="height:100%;width:${m.healthPercent}%;background:${getHealthColor(m.healthPercent)};"></div>
              </div>
              <span style="font-size:12px;font-weight:700;color:${getHealthColor(m.healthPercent)}">${m.healthPercent}%</span>
            </div>
          </td>
          <td><span class="status-badge ${m.failed > 0 ? 'failed' : m.skipped > 0 ? 'skipped' : 'passed'}" ${m.failed > 0 ? `style="cursor:pointer;" onclick="event.stopPropagation();navigateToTab('failures')"` : ''}>${m.failed > 0 ? 'FAIL &#8599;' : m.skipped > 0 ? 'PARTIAL' : 'PASS'}</span></td>
        </tr>`).join("")}
      </table>
    </div>

    <!-- MODULES TAB -->
    <div id="modules" class="tab-panel">
      <div class="module-grid">
        ${modules.map((m) => `
        <div class="module-card" data-module="${m.name}">
          <div class="module-card-header">
            <h3>${m.name}</h3>
            <span class="module-health-badge" style="background:${getHealthColor(m.healthPercent)}">${m.healthPercent}% ${getHealthLabel(m.healthPercent)}</span>
          </div>
          <div class="module-card-body">
            <div class="module-stats">
              <div class="module-stat" style="cursor:pointer;" onclick="filterScenarios('all')"><div class="num" style="color:var(--primary-light)">${m.totalScenarios}</div><div class="lbl">Total &#8599;</div></div>
              <div class="module-stat" style="cursor:pointer;" onclick="filterScenarios('passed')"><div class="num" style="color:var(--success)">${m.passed}</div><div class="lbl">Passed &#8599;</div></div>
              <div class="module-stat" style="cursor:pointer;" onclick="${m.failed > 0 ? "filterScenarios('failed')" : ''}"><div class="num" style="color:var(--danger)">${m.failed}</div><div class="lbl">Failed${m.failed > 0 ? ' &#8599;' : ''}</div></div>
              <div class="module-stat"><div class="num" style="color:var(--accent)">${m.skipped}</div><div class="lbl">Skipped</div></div>
            </div>
            <div class="module-bar">
              <div class="segment passed-seg" style="width:${m.totalScenarios > 0 ? (m.passed / m.totalScenarios) * 100 : 0}%"></div>
              <div class="segment failed-seg" style="width:${m.totalScenarios > 0 ? (m.failed / m.totalScenarios) * 100 : 0}%"></div>
              <div class="segment skipped-seg" style="width:${m.totalScenarios > 0 ? (m.skipped / m.totalScenarios) * 100 : 0}%"></div>
            </div>
            <div class="module-features"><strong>Features:</strong> ${m.features.join(", ")}</div>
          </div>
        </div>`).join("")}
      </div>

      <div id="module-filter-indicator" style="display:none;margin-bottom:16px;padding:10px 16px;background:var(--card-bg);border-radius:8px;border:1px solid var(--border);align-items:center;justify-content:space-between;">
        <span style="font-size:13px;">Showing: <strong id="module-filter-label">All</strong> module</span>
        <button onclick="showAllModules()" style="background:var(--primary-light);color:#fff;border:none;padding:5px 12px;border-radius:4px;cursor:pointer;font-size:12px;">Show All Modules</button>
      </div>
      <h2 style="font-size:16px;margin-bottom:16px;font-weight:700;">Detailed Module Results</h2>
      ${modules.map((m) => {
        const moduleResults = results.filter((r) => r.module === m.name);
        return `
        <div class="module-detail-section" data-module="${m.name}">
        <h3 id="module-section-${modules.indexOf(m)}" style="font-size:14px;margin:20px 0 10px;padding:8px 12px;background:var(--primary-light);color:#fff;border-radius:6px;transition:box-shadow 0.3s;">${m.name} — ${m.passed}/${m.totalScenarios} Passed</h3>
        <table class="data-table">
          <tr><th>Scenario</th><th>Feature</th><th>Steps</th><th>Duration</th><th>Status</th></tr>
          ${moduleResults.map((r, mi) => {
            const failIdx = failedResults.indexOf(r);
            const globalIdx = results.indexOf(r);
            const clickAction = r.status === 'failed'
              ? `onclick="navigateToFailure('failure-${failIdx}')"`
              : `onclick="navigateToScenario(${globalIdx})"`;
            return `
          <tr style="cursor:pointer;" ${clickAction} class="module-row">
            <td>${r.scenario}</td>
            <td style="font-size:12px;color:var(--text-muted)">${r.feature}</td>
            <td>${r.steps.length}</td>
            <td>${formatDuration(r.duration)}</td>
            <td><span class="status-badge ${r.status}">${getStatusIcon(r.status)} ${r.status.toUpperCase()}${r.status === 'failed' ? ' &#8599; Root Cause' : ' &#8599; Details'}</span></td>
          </tr>`;}).join("")}
        </table>
        </div>`;
      }).join("")}
    </div>

    <!-- ALL SCENARIOS TAB -->
    <div id="scenarios" class="tab-panel">
      <div id="filter-indicator" style="display:none;margin-bottom:16px;padding:10px 16px;background:var(--card-bg);border-radius:8px;border:1px solid var(--border);display:none;align-items:center;justify-content:space-between;">
        <span style="font-size:13px;">Showing: <strong id="filter-label">All</strong> scenarios</span>
        <button onclick="filterScenarios('all')" style="background:var(--primary-light);color:#fff;border:none;padding:5px 12px;border-radius:4px;cursor:pointer;font-size:12px;">Show All</button>
      </div>
      <table class="data-table">
        <tr><th>Module</th><th>Feature</th><th>Scenario</th><th>Steps</th><th>Duration</th><th>Status</th></tr>
        ${results.map((r, i) => `
        <tr class="scenario-row" data-status="${r.status}" onclick="toggleRow('detail-${i}')">
          <td><strong>${r.module}</strong></td>
          <td style="font-size:12px;">${r.feature}</td>
          <td>${r.scenario}</td>
          <td>${r.steps.length}</td>
          <td>${formatDuration(r.duration)}</td>
          <td>
            <span class="status-badge ${r.status}">${getStatusIcon(r.status)} ${r.status.toUpperCase()}</span>
            ${r.status === 'failed' ? `<a href="#" onclick="event.stopPropagation();navigateToFailure('failure-${failedResults.indexOf(r)}')" style="margin-left:6px;font-size:11px;color:var(--danger);font-weight:600;text-decoration:none;">View Root Cause &#8599;</a>` : ''}
          </td>
        </tr>
        <tr class="step-details" id="detail-${i}" data-status="${r.status}">
          <td colspan="6">
            <div class="step-list">
              ${r.steps.map((s) => `
              <div class="step-item">
                <span class="step-keyword">${s.keyword}</span>
                <span class="step-name">${s.name}</span>
                <span class="step-duration">${formatDuration(s.duration)}</span>
                <span class="status-badge ${s.status}" style="font-size:10px;padding:2px 6px;">${s.status.toUpperCase()}</span>
              </div>
              ${s.errorMessage ? `<div class="error-block">${s.errorMessage.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</div>` : ""}`).join("")}
            </div>
          </td>
        </tr>`).join("")}
      </table>
    </div>

    <!-- FAILURES TAB -->
    <div id="failures" class="tab-panel">
      ${failedResults.length === 0
        ? `<div class="empty-state"><div class="icon">&#10004;</div><div class="msg">All tests passed! No failures to report.</div></div>`
        : `
      <div class="summary-grid" style="grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));">
        ${modules.filter(m => m.failed > 0).map((m) => `
        <div class="summary-card failed">
          <div class="value">${m.failed}</div>
          <div class="label">${m.name} Failures</div>
        </div>`).join("")}
      </div>

      ${failedResults.map((r, idx) => {
        const failedStep = r.steps.find((s) => s.status === "failed");
        const errorMsg = failedStep?.errorMessage || "No error details available";
        const rootCause = extractRootCause(errorMsg);
        return `
      <div id="failure-${idx}" class="failure-card" style="background:var(--card-bg);border-radius:12px;border:1px solid var(--border);box-shadow:0 1px 3px rgba(0,0,0,0.06);margin-bottom:20px;overflow:hidden;transition:box-shadow 0.3s;">
        <div style="background:#fde8e8;padding:14px 20px;border-bottom:1px solid #fce4e4;display:flex;justify-content:space-between;align-items:center;">
          <div>
            <span style="font-size:18px;margin-right:8px;">&#10008;</span>
            <strong style="font-size:14px;">Failure #${idx + 1}</strong>
            <span style="margin-left:12px;font-size:12px;color:var(--text-muted);">${r.module}</span>
          </div>
          <span class="status-badge failed">FAILED</span>
        </div>
        <div style="padding:20px;">
          <table style="width:100%;border:none;box-shadow:none;margin:0;">
            <tr style="border:none;">
              <td style="width:120px;font-weight:600;font-size:12px;color:var(--text-muted);text-transform:uppercase;padding:6px 12px;border:none;">Feature</td>
              <td style="font-size:13px;padding:6px 12px;border:none;">${r.feature}</td>
            </tr>
            <tr style="border:none;">
              <td style="width:120px;font-weight:600;font-size:12px;color:var(--text-muted);text-transform:uppercase;padding:6px 12px;border:none;">Scenario</td>
              <td style="font-size:13px;padding:6px 12px;border:none;">${r.scenario}</td>
            </tr>
            <tr style="border:none;">
              <td style="width:120px;font-weight:600;font-size:12px;color:var(--text-muted);text-transform:uppercase;padding:6px 12px;border:none;">Failed Step</td>
              <td style="font-size:13px;padding:6px 12px;border:none;"><span class="step-keyword">${failedStep?.keyword || ""}</span> ${failedStep?.name || "N/A"}</td>
            </tr>
            <tr style="border:none;">
              <td style="width:120px;font-weight:600;font-size:12px;color:var(--text-muted);text-transform:uppercase;padding:6px 12px;border:none;">Duration</td>
              <td style="font-size:13px;padding:6px 12px;border:none;">${formatDuration(r.duration)}</td>
            </tr>
          </table>

          <div style="margin-top:16px;padding:14px 18px;background:#fff5f5;border:1px solid #fed7d7;border-radius:8px;">
            <div style="display:flex;align-items:center;gap:8px;margin-bottom:10px;">
              <span style="background:var(--danger);color:#fff;padding:3px 10px;border-radius:4px;font-size:11px;font-weight:700;">ROOT CAUSE</span>
            </div>
            <div style="font-size:13px;color:#c0392b;font-weight:500;line-height:1.6;">${rootCause.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</div>
          </div>

          <details style="margin-top:12px;">
            <summary style="cursor:pointer;font-size:12px;color:var(--text-muted);font-weight:600;padding:6px 0;">View Full Stack Trace</summary>
            <div class="error-block" style="margin-top:8px;">${errorMsg.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</div>
          </details>
        </div>
      </div>`;
      }).join("")}`}
    </div>

  </div>

  <div class="footer">
    QA Automation Report | Environment: <strong>${env.toUpperCase()}</strong> | Generated: ${reportTime} | Duration: ${formatDuration(totalDuration)}
  </div>

  <script>
    function showTab(btn, tabId) {
      document.querySelectorAll('.tab-panel').forEach(el => el.classList.remove('active'));
      document.querySelectorAll('.nav-btn').forEach(el => el.classList.remove('active'));
      document.getElementById(tabId).classList.add('active');
      btn.classList.add('active');
    }
    function navigateToTab(tabId) {
      document.querySelectorAll('.tab-panel').forEach(el => el.classList.remove('active'));
      document.querySelectorAll('.nav-btn').forEach(el => el.classList.remove('active'));
      document.getElementById(tabId).classList.add('active');
      const btns = document.querySelectorAll('.nav-btn');
      btns.forEach(b => { if (b.textContent.toLowerCase().includes(tabId)) b.classList.add('active'); });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    function navigateToModule(moduleName) {
      navigateToTab('modules');
      setTimeout(() => {
        // Filter module cards
        document.querySelectorAll('.module-card').forEach(card => {
          card.style.display = card.getAttribute('data-module') === moduleName ? '' : 'none';
        });
        // Filter detail sections
        document.querySelectorAll('.module-detail-section').forEach(section => {
          section.style.display = section.getAttribute('data-module') === moduleName ? '' : 'none';
        });
        // Show filter indicator
        const indicator = document.getElementById('module-filter-indicator');
        const label = document.getElementById('module-filter-label');
        indicator.style.display = 'flex';
        label.textContent = moduleName;
      }, 50);
    }
    function showAllModules() {
      document.querySelectorAll('.module-card').forEach(card => card.style.display = '');
      document.querySelectorAll('.module-detail-section').forEach(section => section.style.display = '');
      document.getElementById('module-filter-indicator').style.display = 'none';
    }
    function navigateToFailure(failureId) {
      navigateToTab('failures');
      setTimeout(() => {
        const el = document.getElementById(failureId);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
          el.style.boxShadow = '0 0 0 3px var(--danger), 0 4px 12px rgba(231,76,60,0.3)';
          setTimeout(() => { el.style.boxShadow = '0 1px 3px rgba(0,0,0,0.06)'; }, 3000);
        }
      }, 100);
    }
    function filterScenarios(status) {
      navigateToTab('scenarios');
      setTimeout(() => {
        const rows = document.querySelectorAll('#scenarios .scenario-row');
        const details = document.querySelectorAll('#scenarios .step-details');
        const indicator = document.getElementById('filter-indicator');
        const label = document.getElementById('filter-label');
        details.forEach(d => d.style.display = 'none');
        if (status === 'all') {
          rows.forEach(r => r.style.display = '');
          indicator.style.display = 'none';
        } else {
          rows.forEach(r => {
            r.style.display = r.getAttribute('data-status') === status ? '' : 'none';
          });
          indicator.style.display = 'flex';
          label.textContent = status.charAt(0).toUpperCase() + status.slice(1);
        }
      }, 50);
    }
    function navigateToScenario(idx) {
      filterScenarios('all');
      setTimeout(() => {
        const detailId = 'detail-' + idx;
        const el = document.getElementById(detailId);
        if (el) {
          el.style.display = 'table-row';
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 150);
    }
    function toggleRow(id) {
      const el = document.getElementById(id);
      el.style.display = el.style.display === 'table-row' ? 'none' : 'table-row';
    }
  </script>
</body>
</html>`;

  const dir = path.dirname(reportFilePath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(reportFilePath, html, "utf-8");
  console.log(`\n✅ Custom HTML Report generated: ${reportFilePath}\n`);
}

// --- Public API ---

export function generateReport(): void {
  const env = process.env.ENV_NAME || "qa";
  const reportName = getReportFileName();
  const reportsDir = path.resolve(process.cwd(), "reports");

  if (!fs.existsSync(reportsDir)) {
    console.log("No reports/ directory found. Run tests first.");
    return;
  }

  const jsonFiles = fs.readdirSync(reportsDir).filter((f) => f.endsWith(".json"));

  if (jsonFiles.length === 0) {
    console.log("No JSON report files found in reports/ directory. Run tests first.");
    return;
  }

  // Pick the latest JSON report by filename (sorted descending)
  const latestJson = jsonFiles.sort().reverse()[0];
  const jsonPath = path.join(reportsDir, latestJson);
  const results = parseJsonReport(jsonPath);

  if (results.length === 0) {
    console.log(`No scenario results found in ${latestJson}.`);
    return;
  }

  const htmlPath = path.join(reportsDir, `${reportName}.html`);
  generateHtmlReport(results, htmlPath, env);
}

// Auto-run when executed directly via: ts-node src/support/reporters/custom-reporter.ts
if (require.main === module) {
  generateReport();
}
