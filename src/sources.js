// One fetcher per job platform. Each returns jobs in the same shape:
// { id, company, title, location, url, description }

async function getJson(url) {
  const res = await fetch(url, { headers: { "User-Agent": "job-alert-agent" } });
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  return res.json();
}

function decodeEntities(text) {
  return text
    .replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'").replace(/&nbsp;/g, " ").replace(/&amp;/g, "&");
}

// Turn HTML job descriptions into plain text for the AI.
// Greenhouse sends HTML that is itself escaped, so entities are decoded
// once before stripping tags and once after.
export function htmlToText(html = "") {
  const text = decodeEntities(html)
    .replace(/<(br|\/p|\/li|\/h\d)\s*\/?>/gi, "\n")
    .replace(/<[^>]+>/g, " ");
  return decodeEntities(text)
    .replace(/[ \t]+/g, " ")
    .replace(/\n\s*\n+/g, "\n")
    .trim();
}

async function fromGreenhouse(company) {
  // content=true includes the full job description
  const data = await getJson(
    `https://boards-api.greenhouse.io/v1/boards/${company.slug}/jobs?content=true`
  );
  return (data.jobs || []).map((j) => ({
    id: `greenhouse:${company.slug}:${j.id}`,
    company: company.name,
    title: j.title,
    location: j.location?.name || "",
    url: j.absolute_url,
    description: htmlToText(j.content),
  }));
}

async function fromLever(company) {
  const data = await getJson(
    `https://api.lever.co/v0/postings/${company.slug}?mode=json`
  );
  return (data || []).map((j) => ({
    id: `lever:${company.slug}:${j.id}`,
    company: company.name,
    title: j.text,
    location: [j.categories?.location, j.workplaceType].filter(Boolean).join(", "),
    url: j.hostedUrl,
    description: [
      j.descriptionPlain,
      ...(j.lists || []).map((l) => `${l.text}\n${htmlToText(l.content)}`),
    ].filter(Boolean).join("\n"),
  }));
}

async function fromAshby(company) {
  const data = await getJson(
    `https://api.ashbyhq.com/posting-api/job-board/${company.slug}`
  );
  return (data.jobs || []).map((j) => ({
    id: `ashby:${company.slug}:${j.id}`,
    company: company.name,
    title: j.title,
    location: [j.location, j.isRemote ? "Remote" : ""].filter(Boolean).join(", "),
    url: j.jobUrl,
    description: j.descriptionPlain || htmlToText(j.descriptionHtml),
  }));
}

const FETCHERS = { greenhouse: fromGreenhouse, lever: fromLever, ashby: fromAshby };

export async function fetchJobs(company) {
  const fetcher = FETCHERS[company.platform];
  if (!fetcher) throw new Error(`Unknown platform: ${company.platform}`);
  return fetcher(company);
}
