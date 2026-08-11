export function parseArguments(argv) {
  const positional = [];
  const flags = {};
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg.includes("=")) {
      const parts = arg.split("=");

      const key = parts[0].replace("--", "");
      const value = parts[1];
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
