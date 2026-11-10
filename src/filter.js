import { TITLE_INCLUDE, TITLE_EXCLUDE, LOCATION_INCLUDE } from "./config.js";

const hasAny = (text, words) => words.some((w) => text.includes(w));

// Cheap keyword check that runs before the AI, so we only pay to score likely fits.
export function isMatch(job) {
  const title = (job.title || "").toLowerCase();
  const location = (job.location || "").toLowerCase();

  if (!hasAny(title, TITLE_INCLUDE)) return false;
  if (hasAny(title, TITLE_EXCLUDE)) return false;
  if (LOCATION_INCLUDE.length > 0 && !hasAny(location, LOCATION_INCLUDE)) return false;

  return true;
}
