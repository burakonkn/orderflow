import { readJSON, writeJSON } from "../utils/file.js";

export function createRepository(filePath) {
  return {
    async getAll() {
      const data = await readJSON(filePath);
      return data;
    },
    async getById(id) {
      const all = await this.getAll();
      return all.find((x) => x.id === id);
    },
    async create(newRecordWithoutId) {
      const all = await this.getAll();
      const newId = (all.at(-1)?.id ?? 0) + 1;
      const newObject = { ...newRecordWithoutId, id: newId };
      all.push(newObject);
      await writeJSON(filePath, all);
      return newObject;
    },
    async update(id, patch) {
      const all = await this.getAll();
      const index = all.findIndex((x) => x.id === id);
      if (index === -1) {
        return undefined;
      }
      const updatedData = { ...all[index], ...patch };
      all[index] = updatedData;
      await writeJSON(filePath, all);
      return updatedData;
    },
  };
}
