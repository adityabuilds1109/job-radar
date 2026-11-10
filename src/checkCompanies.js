// Run `npm run check` to see which company slugs work and how many jobs each has.
import { COMPANIES } from "./companies.js";
import { fetchJobs } from "./sources.js";

for (const company of COMPANIES) {
  try {
    const jobs = await fetchJobs(company);
    console.log(`OK    ${company.name} (${company.platform}/${company.slug}): ${jobs.length} jobs`);
  } catch (err) {
    console.log(`FAIL  ${company.name} (${company.platform}/${company.slug}): ${err.message}`);
  }
}
