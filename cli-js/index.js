import { parseArguments } from "./src/cli/arguments.js";
import { runCommand } from "./src/cli/commands.js";

const { positional, flags } = parseArguments(process.argv.slice(2));
await runCommand({ positional, flags });
