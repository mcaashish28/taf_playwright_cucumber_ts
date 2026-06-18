/* eslint-disable @typescript-eslint/no-explicit-any */
import * as fs from "fs";
import * as path from "path";
import { Logger } from "./logger";

let currentEnv = process.env.ENV_NAME || process.env.ENV || "qa";
try {
  const cfg = require("../support/config");
  if (cfg?.currentEnv) currentEnv = cfg.currentEnv;
} catch (_) {
  /* no config file */
}

function resolveTestDataFile(fileName?: string): string {
  if (fileName) {
    const direct = path.isAbsolute(fileName) ? fileName : path.resolve(process.cwd(), fileName);
    if (fs.existsSync(direct)) return direct;
  }

  const env = currentEnv.toLowerCase();
  const candidates = [
    `${env}_testdata.csv`,
    `testdata_${env}.csv`,
    `test-data/${env}_testdata.csv`,
    `test-data/testdata_${env}.csv`,
  ];
  for (const c of candidates) {
    const full = path.resolve(process.cwd(), c);
    if (fs.existsSync(full)) return full;
  }
  throw new Error(
    `Test data CSV not found. Looked for: ${candidates.join(", ")} in ${process.cwd()}`,
  );
}

function parseCsvLine(line: string): string[] {
  const out: string[] = [];
  let cur = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (inQuotes) {
      if (ch === '"' && line[i + 1] === '"') {
        cur += '"';
        i++;
      } else if (ch === '"') {
        inQuotes = false;
      } else {
        cur += ch;
      }
    } else if (ch === '"') {
      inQuotes = true;
    } else if (ch === ",") {
      out.push(cur);
      cur = "";
    } else {
      cur += ch;
    }
  }
  out.push(cur);
  return out.map((s) => s.trim());
}

export async function csvToMap(fileName?: string): Promise<Map<string, string>> {
  const filePath = resolveTestDataFile(fileName);
  Logger.info(`Reading CSV test data from: ${filePath}`);

  const text = fs.readFileSync(filePath, "utf-8");
  const rows = text
    .split(/\r?\n/)
    .filter((l) => l.trim().length > 0)
    .map(parseCsvLine);

  const dataMap = new Map<string, string>();
  // Skip header if it looks like one (col1 in {key,name,id} and col2 in {value})
  let startIdx = 0;
  if (rows.length > 0) {
    const [h1, h2] = rows[0];
    if (
      h1 &&
      h2 &&
      ["key", "name", "id"].includes(h1.toLowerCase()) &&
      ["value", "val", "data"].includes(h2.toLowerCase())
    ) {
      startIdx = 1;
    }
  }
  for (let i = startIdx; i < rows.length; i++) {
    const [k, v] = rows[i];
    if (k && v !== undefined) dataMap.set(k, v);
  }
  return dataMap;
}

export async function xlsToMap(
  filePath: string,
  sheetName?: string,
): Promise<Map<string, string>> {
  let xlsx: any;
  try {
    xlsx = require("xlsx");
  } catch (_) {
    throw new Error(
      "xlsx module not installed. Run: npm install xlsx --save-dev (or use csvToMap instead)",
    );
  }
  const absolute = path.isAbsolute(filePath) ? filePath : path.resolve(process.cwd(), filePath);
  Logger.info(`Reading Excel test data from: ${absolute}`);
  const wb = xlsx.readFile(absolute);
  const sheet = wb.Sheets[sheetName || wb.SheetNames[0]];
  const rows: any[][] = xlsx.utils.sheet_to_json(sheet, { header: 1 });
  const dataMap = new Map<string, string>();
  let startIdx = 0;
  if (rows.length > 0) {
    const [h1, h2] = rows[0] || [];
    if (
      typeof h1 === "string" &&
      typeof h2 === "string" &&
      ["key", "name", "id"].includes(h1.toLowerCase()) &&
      ["value", "val", "data"].includes(h2.toLowerCase())
    ) {
      startIdx = 1;
    }
  }
  for (let i = startIdx; i < rows.length; i++) {
    const [k, v] = rows[i] || [];
    if (k !== undefined && v !== undefined) dataMap.set(String(k).trim(), String(v).trim());
  }
  return dataMap;
}

let cachedMap: Map<string, string> | undefined;
export async function loadTestData(fileName?: string): Promise<Map<string, string>> {
  if (cachedMap) return cachedMap;
  cachedMap = await csvToMap(fileName);
  return cachedMap;
}

export function clearTestDataCache(): void {
  cachedMap = undefined;
}

export async function getTestData(key: string, fallback?: string): Promise<string> {
  const map = await loadTestData();
  const val = map.get(key);
  if (val !== undefined) return val;
  if (fallback !== undefined) return fallback;
  throw new Error(`Test data key '${key}' not found in qa_testdata.csv`);
}

export function resolveTd(
  raw: string,
  map?: Map<string, string>,
): string {
  if (!raw || typeof raw !== "string") return raw;
  if (!raw.startsWith("td-")) return raw;
  const key = raw.slice(3);
  const lookup = map || cachedMap;
  if (!lookup) {
    Logger.warn(`resolveTd called but no test data map loaded. Returning raw: ${raw}`);
    return raw;
  }
  if (!lookup.has(key)) {
    Logger.warn(`Invalid Test Data key provided: ${raw}`);
    return raw;
  }
  return lookup.get(key) as string;
}

export async function updateDatatable(
  this: any,
  dataTable: any,
  mapval: any,
  textReportUpdate: (msg: string) => void,
  dataType: string,
): Promise<any> {
  if (!mapval || typeof mapval.has !== "function") {
    Logger.warn("updateDatatable: mapval is undefined or not a Map. Returning raw dataTable.");
    return dataType === "inString" ? dataTable : dataTable?.raw?.() || dataTable;
  }
  let data: any;
  const resolveOne = (value: string): string => {
    if (!value.startsWith("td-")) return value;
    const key = value.slice(3);
    if (mapval.has(key)) {
      const resolved = mapval.get(key);
      textReportUpdate(`${value} value is ${resolved}`);
      return resolved;
    }
    textReportUpdate(`invalid Test Data key value provided ${value}`);
    return value;
  };
  switch (dataType) {
    case "raw":
      data = dataTable.raw();
      for (const row of data)
        for (let i = 0; i < row.length; i++) row[i] = resolveOne(row[i]);
      break;
    case "rowsHash":
      data = dataTable.rowsHash();
      for (const key of Object.keys(data)) data[key] = resolveOne(data[key]);
      break;
    case "hashes":
      data = dataTable.hashes();
      for (const row of data) for (const key in row) row[key] = resolveOne(row[key]);
      break;
    case "inString":
      data = resolveOne(dataTable);
      break;
    default:
      data = dataTable;
  }
  return data;
}

export async function sortStrings(a: string, b: string): Promise<number> {
  a = a.toLowerCase();
  b = b.toLowerCase();
  return a > b ? 1 : a < b ? -1 : 0;
}
