import net from "node:net";
net.setDefaultAutoSelectFamilyAttemptTimeout(1000); // Lever (US) is slow from India; Node's 250 ms default times out
import "dotenv/config";
import { COMPANIES } from "./companies.js";
import { fetchJobs } from "./sources.js";
import { isMatch } from "./filter.js";
import { loadResume } from "./resume.js";
import { scoreJob } from "./scorer.js";
import { loadSeen, saveSeen } from "./store.js";
import { sendEmail } from "./mailer.js";
import { MIN_SCORE, MAX_TO_SCORE } from "./config.js";

const DRY_RUN = process.env.DRY_RUN === "true";

async function main() {
  const resume = loadResume();
  const seen = loadSeen();

  // 1. Fetch every company in parallel. One broken board shouldn't stop the run.
  const results = await Promise.allSettled(COMPANIES.map(fetchJobs));
  const candidates = [];

  results.forEach((result, i) => {
    const company = COMPANIES[i];
    if (result.status === "rejected") {
      console.warn(`Skipped ${company.name}: ${result.reason.message}`);
      return;
    }
    for (const job of result.value) {
      if (!seen.has(job.id) && isMatch(job)) candidates.push(job);
    }
  });

  console.log(`${candidates.length} new job(s) passed the keyword filter.`);

  // 2. Score with Claude, capped per run. Jobs over the cap wait for the next run.
  const toScore = candidates.slice(0, MAX_TO_SCORE);
  const scored = [];

  for (const job of toScore) {
    try {
      const result = await scoreJob(job, resume);
      scored.push({ ...job, ...result });
      console.log(`${result.score}/100  ${job.company} | ${job.title}`);
      seen.add(job.id); // mark seen only once scored
    } catch (err) {
      console.warn(
        `Could not score ${job.company} | ${job.title}: ${err.message}`,
      );
    }
  }

  // 3. Keep good matches, best first.
  const matches = scored
    .filter((j) => j.score >= MIN_SCORE)
    .sort((a, b) => b.score - a.score);

  console.log(`${matches.length} job(s) scored ${MIN_SCORE}+.`);

  if (DRY_RUN) {
    console.log("Dry run: no email sent, seen list not saved.");
    return;
  }

  if (matches.length > 0) {
    await sendEmail(matches);
    console.log("Email sent.");
  }

  saveSeen(seen);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
