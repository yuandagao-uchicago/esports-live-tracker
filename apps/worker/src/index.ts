import { config as dotenv } from "dotenv";
import { existsSync } from "node:fs";
import { resolve } from "node:path";

for (const p of [".env.local", "../../.env.local", ".env"]) {
  const full = resolve(process.cwd(), p);
  if (existsSync(full)) {
    dotenv({ path: full });
    break;
  }
}

const { start } = await import("./scheduler.js");

console.log("[worker] starting esports tracker");
console.log("[worker] games:", process.env.WORKER_GAMES ?? "lol,csgo,valorant");

start();

process.on("SIGTERM", () => {
  console.log("[worker] SIGTERM — exiting");
  process.exit(0);
});
