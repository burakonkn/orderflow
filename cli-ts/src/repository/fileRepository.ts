import { promises as fs } from "node:fs";
import { z } from "zod";

export class FileRepository<T extends { id: number }> {
  constructor(
    private filePath: string,
    private schema: z.ZodType<T>,
  ) {}

  async getAll(): Promise<T[]> {
    const raw = await fs.readFile(this.filePath, "utf-8");
    const parsed: unknown = JSON.parse(raw);
    const result = z.array(this.schema).safeParse(parsed);
    if (!result.success) {
      throw new Error("İstenilen türde veri gelmedi.", { cause: result.error });
    }
    return result.data;
  }

  async getById(id: number): Promise<T | undefined> {
    const all = await this.getAll();
    const data = all.find((x) => x.id === id);
    return data;
  }

  async create(record: Omit<T, "id">): Promise<T> {
    const all = await this.getAll();
    const newId: number = (all.at(-1)?.id ?? 0) + 1;
    const newObject = { ...record, id: newId } as T;
    all.push(newObject);
    await fs.writeFile(this.filePath, JSON.stringify(all, null, 2));
    return newObject;
  }

  async update(
    id: number,
    patch: Partial<Omit<T, "id">>,
  ): Promise<T | undefined> {
    const all = await this.getAll();
    const index = all.findIndex((x) => x.id === id);
    if (index === -1) {
      return undefined;
    }
    const updatedObject = { ...all[index], ...patch } as T;
    all[index] = updatedObject;
    await fs.writeFile(this.filePath, JSON.stringify(all, null, 2));
    return updatedObject;
  }
}
