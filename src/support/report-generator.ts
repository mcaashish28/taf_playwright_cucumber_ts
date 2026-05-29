const report = require("multiple-cucumber-html-reporter");

report.generate({
  jsonDir: "test-results/",
  reportPath: "test-results/html-report/",
  metadata: {
    browser: {
      name: "chromium",
      version: "latest",
    },
    device: "Local Machine",
    platform: {
      name: "macOS",
      version: "latest",
    },
  },
  customData: {
    title: "Test Execution Report",
    data: [
      { label: "Project", value: "Playwright Cucumber TS" },
      { label: "Execution Start Time", value: new Date().toISOString() },
    ],
  },
});
