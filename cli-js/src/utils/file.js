import { promises as fs } from "node:fs";

export async function readJSON(filePath) {
  const result = await fs.readFile(filePath, "utf-8");
  return JSON.parse(result);
}

export async function writeJSON(filePath, data) {
  const content = JSON.stringify(data, null, 2);
  await fs.writeFile(filePath, content);
}
