# JobRadar

AI-powered Node.js agent. It fetches jobs from company boards (Greenhouse, Lever, Ashby public APIs), keyword-filters them, scores each against my resume with an LLM (local Ollama by default, Claude Haiku optional), and emails the best matches with scores and apply links.

## Commands

- `npm install` — install dependencies
- `npm run check` — test which company slugs in `src/companies.js` work
- `npm run dry` — full pipeline including AI scoring, but no email and no saving
- `npm start` — real run: emails matches and updates `data/seen.json`

## Pipeline

fetch (`sources.js`) → keyword filter (`filter.js`) → skip seen (`store.js`) → AI score (`scorer.js`) → keep score ≥ MIN_SCORE, sort → email (`mailer.js`) → save seen

## Structure

- `src/config.js` — all tunable settings: keywords, model, MIN_SCORE, MAX_TO_SCORE
- `src/sources.js` — one fetcher per platform; all return `{ id, company, title, location, url, description }`
- `src/scorer.js` — prompt, provider functions (`askAnthropic`, `askOllama`), and `parseScore()`, which must always return `{ score, reasons, missing }`. New providers take `(system, user)` and return reply text.
- `src/resume.js` — reads `RESUME_TEXT` env var or `data/resume.txt`
- `.github/workflows/job-alert.yml` — schedule and secrets

## Rules

- Plain JavaScript, ES modules, Node 18+ built-in `fetch`.
- Only official public job APIs. Never scrape LinkedIn, Naukri, Indeed, or Glassdoor.
- My resume must never be committed. `data/resume.txt` stays gitignored.
- Never hardcode secrets or API keys.
- One failing company or one failed AI call must never stop the whole run.
- Keyword filtering stays before AI scoring, to keep API cost low.
- Keep dependencies minimal. Ask before adding a package.
- Test with `npm run dry`, not `npm start`.
- Default provider is Ollama (`qwen2.5:7b`). Don't make the paid API the default.

## How I work

- I'm learning, so explain why when a change isn't obvious.
- One feature per branch, small changes, so each becomes its own commit and PR.
- Don't commit or push for me. I review diffs and commit myself.
