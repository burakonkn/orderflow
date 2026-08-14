import { NotFoundError } from "../errors/notFoundError.js";

export interface ParsedArguments {
  positional: string[];
  flags: Record<string, string>;
}

export function parseArguments(argv: string[]): ParsedArguments {
  const positional: string[] = [];
  const flags: Record<string, string> = {};
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];

    if (typeof arg === "undefined") {
      throw new NotFoundError("argv no found");
    }

    if (arg.includes("=")) {
      const parts = arg.split("=");

      const key = parts[0]!.replace("--", "");
      const value = parts[1] ?? "";
      flags[key] = value;
      continue;
    }
    positional.push(arg);
  }

  return {
    positional: positional,
    flags: flags,
  };
}
