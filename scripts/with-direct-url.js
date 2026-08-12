// Runs a command (Prisma CLI) with DATABASE_URL temporarily swapped for
// DIRECT_URL (the Supabase Session pooler). `prisma migrate`/`prisma db seed`
// need session-level features the Transaction pooler (the app's normal
// DATABASE_URL) doesn't support. Cross-platform on purpose — plain shell
// `VAR=value cmd` syntax doesn't work on Windows.
require("dotenv").config();

const { spawnSync } = require("node:child_process");

if (!process.env.DIRECT_URL) {
  console.error("DIRECT_URL is not set in .env — required to run Prisma migrations.");
  process.exit(1);
}

process.env.DATABASE_URL = process.env.DIRECT_URL;

const [, , cmd, ...args] = process.argv;
const result = spawnSync(cmd, args, {
  stdio: "inherit",
  shell: true,
  env: process.env,
});

process.exit(result.status ?? 1);
