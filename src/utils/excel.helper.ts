/* eslint-disable @typescript-eslint/no-explicit-any */
import { parse } from 'csv-parse';
import * as fs from 'fs';

let currentEnv = process.env.ENV || 'QA';
try {
  const cfg = require('../support/config');
  if (cfg?.currentEnv) currentEnv = cfg.currentEnv;
} catch (_) { /* no config file */ }

// export async function getXlsSheeetRowCount(filePath1: string, fileName: string, sheetName: string) {
//   try {
//     const filePath = path.resolve(filePath1, fileName);
//     const workbook = new Excel.Workbook();
//     const content = await workbook.xlsx.readFile(filePath);
//     const worksheet = content.getWorksheet(sheetName);
//     return worksheet!.rowCount - 1;
//   } catch (error) {
//     console.log(error);
//     return error;
//   }
// }

export async function csvToMap(): Promise<Map<string, string>> {
  // Read the whole CSV file as text
  //const csvText = fs.readFileSync('testdata.csv', 'utf-8');
  const csvText = fs.readFileSync(`testdata_${currentEnv.toLowerCase()}.csv`, 'utf-8');

  // Parse CSV content: returns an array of rows
  const records = parse(csvText, {
    delimiter: ',', // adjust if you use "|", ";", etc.
    skip_empty_lines: true,
  });

  // Create a Map from the two columns
  const dataMap = new Map<string, string>();
  for await (const row of records) {
    const [col1, col2] = row;
    if (col1 && col2) {
      dataMap.set(col1.trim(), col2.trim());
    }
  }

  // // Optional log
  // for (const [key, value] of dataMap) {
  //   console.log(key, value);
  // }

  return dataMap;
}

// export async function xlstoMap() {
//   const workbook = new Excel.Workbook();
//   await workbook.xlsx.readFile('testdata.xlsx');
//   const worksheet = workbook.getWorksheet(1);
//   const data_map = new Map<string, string>();

//   for (let i = 1; i <= worksheet!.rowCount; i++) {
//     const cell1: any = worksheet!.getRow(i).getCell(1).value;
//     const cell2: any = worksheet!.getRow(i).getCell(2).value;
//     data_map.set(cell1, cell2);
//   }
//   for (const [key, value] of data_map) {
//     console.log(key, value);
//   }
//   return data_map;
// }
export async function updateDatatable(
  this: any,
  dataTable: any,
  mapval: any,
  textReportUpdate: any,
  dataType: string,
) {
  if (!mapval || typeof mapval.has !== 'function') {
    console.log('Warning: mapval is undefined or not a Map. Returning raw dataTable.');
    return dataType === 'inString' ? dataTable : dataTable?.raw?.() || dataTable;
  }
  let data: any;
  switch (dataType) {
    case 'raw':
      data = dataTable.raw();
      for (const row of data) {
        for (let icnt = 0; icnt < row.length; icnt++) {
          const value = row[icnt];
          if (value.startsWith('td-')) {
            if (mapval.has(value.split('td-')[1])) {
              row[icnt] = mapval.get(value.split('td-')[1]);
              textReportUpdate(value + ' value is ' + row[icnt]);
            } else {
              textReportUpdate('invalid Test Data key value provided ' + value);
              console.log('invalid Test Data key value provided ' + value);
            }
          }
        }
      }
      break;
    case 'rowsHash':
      data = dataTable.rowsHash();
      console.log(1111111);
      for (const key of Object.keys(data)) {
        // console.log(`${key}: ${data[key as keyof typeof data]}`);
        console.log(key);
        const value = data[key];
        if (value.startsWith('td-')) {
          if (mapval.has(value.split('td-')[1])) {
            data[key] = mapval.get(value.split('td-')[1]);
            textReportUpdate(value + ' value is ' + data[key]);
          } else {
            textReportUpdate('invalid Test Data key value provided ' + value);
            console.log('invalid Test Data key value provided ' + value);
          }
        }
      }
      break;
    case 'hashes':
      data = dataTable.hashes();
      for (const row of data) {
        for (const key in row) {
          const value = row[key];
          if (value.startsWith('td-')) {
            if (mapval.has(value.split('td-')[1])) {
              row[key] = mapval.get(value.split('td-')[1]);
              textReportUpdate(value + ' value is ' + row[key]);
            } else {
              textReportUpdate('invalid Test Data key value provided ' + value);
              console.log('invalid Test Data key value provided ' + value);
            }
          }
        }
      }
      break;
    case 'inString':
      data = dataTable;
      if (data.startsWith('td-')) {
        if (mapval.has(data.split('td-')[1])) {
          const value = data;
          data = mapval.get(data.split('td-')[1]);
          textReportUpdate(value + ' value is ' + data);
        } else {
          textReportUpdate('invalid Test Data key value provided ' + data);
          console.log('invalid Test Data key value provided ' + data);
        }
      }
      break;
    default:
      break;
  }
  return data;
}

export async function sortStrings(a: string, b: string) {
  a = a.toLowerCase();
  b = b.toLowerCase();
  return a > b ? 1 : a < b ? -1 : 0;
}
