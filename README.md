# JobRadar: AI Job-Matching Agent

An AI-powered job alert agent built with Node.js and a local LLM (Ollama), with optional Claude support. Twice a day it checks the job boards of companies I want to work at, scores every relevant opening against my resume, and emails me the best matches with a score, the reasons, my skill gaps, and an apply link.

## Why I built it

Job hunting means checking dozens of career pages and reading descriptions that often don't fit. This agent does the checking and first-pass screening for me, so I only spend time on roles where I have a real chance.

## How it works

```
Company job boards (Greenhouse / Lever / Ashby public APIs)
        │  fetch in parallel
        ▼
Keyword filter (title, seniority, location)   ← cheap, no AI cost
        │
        ▼
Skip jobs already seen (data/seen.json)
        │
        ▼
LLM scores each job vs my resume → { score, reasons, missing }
        │
        ▼
Keep score ≥ 60, sort best first → email with Apply links
```

## Design decisions

- **Public APIs only.** Greenhouse, Lever, and Ashby publish job board APIs for exactly this. No scraping of LinkedIn or Naukri.
- **Filter before AI.** A keyword pass removes clearly irrelevant jobs first, so the AI only scores likely fits and the cost stays at a few cents a day.
- **Fault tolerant.** `Promise.allSettled` means one broken company board doesn't stop the run, and a failed AI call skips only that job.
- **Swappable AI provider.** Scoring goes through one `ask()` function, so a free local Ollama model (default, Qwen 2.5 7B) and Claude Haiku are interchangeable with one setting.
- **Structured AI output.** The model returns JSON, and `parseScore()` validates and clamps it so a bad reply can't break the email.
- **Private resume.** My resume lives in a gitignored file locally and a GitHub Secret in CI.

## Setup

```bash
npm install
cp .env.example .env                 # add your keys
cp data/resume.example.txt data/resume.txt   # paste your resume
npm run check                        # see which company slugs work
npm run dry                          # full run with scoring, no email
npm start                            # real run
```

You need:

- **Ollama** (free): install from [ollama.com](https://ollama.com), then `ollama pull qwen2.5:7b`. Keep the Ollama app running while the agent runs.
- A **Gmail app password**: Google Account → Security → 2-Step Verification on → App passwords.

**Optional: Claude Haiku.** Set `LLM_PROVIDER=anthropic` and `ANTHROPIC_API_KEY` in `.env`. It costs about $0.0003 per job and works in GitHub Actions, while Ollama only runs on your own machine.

## Run it daily on your Mac

Ollama runs locally, so schedule the agent on your own machine. Run `crontab -e` and add:

```
30 9,18 * * * cd /path/to/job-alert-agent && /usr/local/bin/npm start >> data/run.log 2>&1
```

Use `which npm` to get the right npm path. The laptop must be awake at those times.

## Run on GitHub Actions (Claude Haiku only)

In the repo: Settings → Secrets and variables → Actions → add:
`ANTHROPIC_API_KEY`, `RESUME_TEXT` (paste your resume text), `GMAIL_USER`, `GMAIL_APP_PASSWORD`, `MAIL_TO`.

Then open the Actions tab and run "Job Alert" manually once. After that it runs at 9 AM and 6 PM IST.

## Configuration

Everything tunable is in `src/config.js`: title keywords, excluded seniority words, locations, model, minimum score, and max jobs scored per run. Companies are in `src/companies.js`.

## Built with

Node.js · Ollama (Qwen 2.5) · Anthropic Claude API · Nodemailer · GitHub Actions. Developed with Claude Code as an AI pair programmer, guided by `CLAUDE.md`.

## Known limitations

- The local 7B model gives coarse scores (often clustered around 45/62/65) and sometimes rates Java/Python roles too high. Next step: stricter scoring rules in the prompt, or Claude Haiku for scoring.
- Only Greenhouse, Lever and Ashby boards are supported.

## Notable fix

Node's fetch timed out against Lever's US servers from India while curl worked. Cause: Node 20+ gives each server address 250 ms to connect, too short for this route. Fixed by raising it to 1000 ms with `net.setDefaultAutoSelectFamilyAttemptTimeout`.
