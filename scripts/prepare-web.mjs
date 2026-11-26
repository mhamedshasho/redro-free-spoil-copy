import { cp, mkdir, rm } from "node:fs/promises";
import { existsSync } from "node:fs";

const root = process.cwd();
const output = new URL("../www/", import.meta.url);

await rm(output, { recursive: true, force: true });
await mkdir(output, { recursive: true });

for (const entry of ["index.html", "app.js", "ui.js", "expiry-entry.js", "runtime-services.js", "enhancements.js", "inventory-fields.js", "activity-report.js", "styles.css", "manifest.webmanifest", "sw.js", "assets"]) {
  if (existsSync(new URL("../" + entry, import.meta.url))) {
    await cp(new URL("../" + entry, import.meta.url), new URL("../www/" + entry, import.meta.url), { recursive: true });
  }
}
