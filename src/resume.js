// Loads my resume text. It is kept OUT of the git repo for privacy.
// Locally: data/resume.txt (gitignored). In GitHub Actions: the RESUME_TEXT secret.
import fs from "node:fs";
import path from "node:path";

export function loadResume() {
  if (process.env.RESUME_TEXT) return process.env.RESUME_TEXT;

  const file = path.resolve("data/resume.txt");
  if (fs.existsSync(file)) return fs.readFileSync(file, "utf8");

  throw new Error(
    "No resume found. Add data/resume.txt locally or set the RESUME_TEXT secret."
  );
}
