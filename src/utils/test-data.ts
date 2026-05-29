import * as fs from "fs";
import * as path from "path";

export class TestData {
  static readJSON<T>(fileName: string): T {
    const filePath = path.resolve(__dirname, `../../test-data/${fileName}`);
    const rawData = fs.readFileSync(filePath, "utf-8");
    return JSON.parse(rawData) as T;
  }

  static generateRandomString(length: number): string {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let result = "";
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  static generateRandomEmail(): string {
    return `test_${this.generateRandomString(8)}@example.com`;
  }

  static getCurrentTimestamp(): string {
    return new Date().toISOString().replace(/[:.]/g, "-");
  }
}
