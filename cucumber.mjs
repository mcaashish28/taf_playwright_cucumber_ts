// ============================================================================
// CUCUMBER CONFIGURATION - Portable across projects
// ============================================================================
// Env vars: ENV_NAME (default: "qa"), TAGS (optional tag filter)
// Report output: reports/report_<env>_<dd>_<mm>_<yyyy>_<hh>_<mm>_<ss>_<AM|PM>
// ============================================================================

function getReportFileName() {
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

const reportName = getReportFileName();

const common = {
  requireModule: ["ts-node/register"],
  require: [
    "./src/steps/*.ts",
    "./src/steps/step_definitions/**/*.ts",
    "./src/support/custom-world.ts",
    "./src/support/hooks.ts",
  ],
  paths: ["./features/**/*.feature"],
  publish: false,
  format: [
    "progress-bar",
    `json:reports/${reportName}.json`,
  ],
  formatOptions: { snippetInterface: "async-await" },
};

const defaultProfile = { ...common };
const regression = { ...common, tags: "@regression" };

export default defaultProfile;
export { regression };
