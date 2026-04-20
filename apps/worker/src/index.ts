import "dotenv/config";
import { start } from "./scheduler.js";

console.log("[worker] starting esports tracker");
console.log("[worker] games:", process.env.WORKER_GAMES ?? "lol,csgo,valorant");

start();

process.on("SIGTERM", () => {
  console.log("[worker] SIGTERM — exiting");
  process.exit(0);
});
