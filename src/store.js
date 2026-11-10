// Remembers which jobs were already processed, so each job is scored and emailed once.
import fs from "node:fs";
import path from "node:path";

const FILE = path.resolve("data/seen.json");

export function loadSeen() {
  try {
    return new Set(JSON.parse(fs.readFileSync(FILE, "utf8")));
  } catch {
    return new Set(); // first run, or the file is missing
  }
}

export function saveSeen(seen) {
  fs.mkdirSync(path.dirname(FILE), { recursive: true });
  fs.writeFileSync(FILE, JSON.stringify([...seen], null, 2));
}
