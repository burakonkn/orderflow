import { z } from "zod";
import { promises as fs } from "node:fs";

const ConfigSchema = z.object({
  dataDir: z.string().default("./data"),
  currency: z.string().default("TRY"),
  dateFormat: z.string().default("ISO"),
});

type Config = z.infer<typeof ConfigSchema>;

async function loadConfig(): Promise<Config> {
  try {
    const data = await fs.readFile("./orderflow.config.json", "utf-8");
    const json: unknown = JSON.parse(data);
    const result = ConfigSchema.safeParse(json);
    if (!result.success) {
      throw new Error("İstenilen türde veri gelmedi.", { cause: result.error });
    }
    return result.data;
  } catch (error) {
    if (error instanceof Error && "code" in error) {
      if (error.code === "ENOENT") {
        return ConfigSchema.parse({});
      }
    }
    throw error;
  }
}

export const config = await loadConfig();
