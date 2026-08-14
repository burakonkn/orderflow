import { parseArguments } from "./cli/arguments.js";
import { runCommand } from "./cli/commands.js";

const parsed = parseArguments(process.argv.slice(2));
await runCommand(parsed);
