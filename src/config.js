// Edit this file to change what counts as a match and how scoring works.

// --- Keyword pre-filter (cheap, runs before the AI) ---

// Title must contain at least one of these (case-insensitive).
export const TITLE_INCLUDE = [
  "node", "backend", "back-end", "back end",
  "full stack", "fullstack", "full-stack",
  "software engineer", "software developer", "sde",
];

// Skip the job if the title contains any of these.
export const TITLE_EXCLUDE = [
  "senior", "sr.", "sr ", "lead", "staff", "principal", "architect",
  "manager", "director", "head of", "intern",
  "android", "ios", "data scientist", "machine learning",
];

// Location must contain one of these. Use [] to accept any location.
export const LOCATION_INCLUDE = [
  "india", "bangalore", "bengaluru", "indore", "pune", "hyderabad",
  "remote", "gurgaon", "gurugram", "noida", "mumbai", "chennai",
];

// --- AI scoring ---

// Which AI scores the jobs: "ollama" (free, local, default) or "anthropic" (Claude Haiku, paid).
export const PROVIDER = process.env.LLM_PROVIDER || "ollama";

// Ollama settings. Pull the model first with: ollama pull qwen2.5:7b
export const OLLAMA_URL = process.env.OLLAMA_URL || "http://localhost:11434";
export const OLLAMA_MODEL = process.env.OLLAMA_MODEL || "qwen2.5:7b";

// Claude model, used only when PROVIDER is "anthropic".
export const MODEL = "claude-haiku-5-5";

// Only email jobs scoring at least this much (0-100).
export const MIN_SCORE = 60;

// Max jobs to score per run, to keep API cost predictable.
export const MAX_TO_SCORE = 25;

// Job descriptions are trimmed to this many characters before scoring.
export const MAX_DESCRIPTION_CHARS = 6000;
