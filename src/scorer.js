// Scores a job against my resume using a local Ollama model (free) or Claude (paid).
import {
  PROVIDER, MODEL, OLLAMA_URL, OLLAMA_MODEL, MAX_DESCRIPTION_CHARS,
} from "./config.js";

const SYSTEM_PROMPT = `You are a strict technical recruiter screening jobs for one candidate.
Compare the candidate's resume with the job and judge how likely they are to get an interview.

Scoring guide:
- 80-100: strong fit. Core stack and experience level match.
- 60-79: decent fit. Core stack matches, with gaps the candidate could close.
- 40-59: weak fit. Major required skills or seniority are missing.
- 0-39: poor fit.

Be honest. Penalize jobs needing far more years than the candidate has, or a different primary language.

Reply with ONLY a JSON object, no other text:
{"score": <0-100 integer>, "reasons": ["<short reason>", "<short reason>"], "missing": ["<skill>", "<skill>"]}`;

// --- Providers: each takes (system, user) and returns the model's reply text ---

async function askOllama(system, user) {
  let res;
  try {
    res = await fetch(`${OLLAMA_URL}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: OLLAMA_MODEL,
        stream: false,
        format: "json", // forces the model to reply with valid JSON
        options: { temperature: 0.2 }, // low = more consistent scores
        messages: [
          { role: "system", content: system },
          { role: "user", content: user },
        ],
      }),
    });
  } catch {
    throw new Error(`Can't reach Ollama at ${OLLAMA_URL}. Is the Ollama app running?`);
  }
  if (!res.ok) {
    throw new Error(`Ollama error ${res.status}: ${await res.text()} (did you run "ollama pull ${OLLAMA_MODEL}"?)`);
  }
  const data = await res.json();
  return data.message?.content || "";
}

let anthropicClient;
async function askAnthropic(system, user) {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error("Missing ANTHROPIC_API_KEY (see README)");
  }
  if (!anthropicClient) {
    // Loaded only when needed, so the Ollama setup doesn't require this package.
    const { default: Anthropic } = await import("@anthropic-ai/sdk");
    anthropicClient = new Anthropic();
  }
  const response = await anthropicClient.messages.create({
    model: MODEL,
    max_tokens: 400,
    system,
    messages: [{ role: "user", content: user }],
  });
  return response.content.find((c) => c.type === "text")?.text || "";
}

const PROVIDERS = { ollama: askOllama, anthropic: askAnthropic };

// Lets tests swap in a fake model instead of calling a real one.
let askOverride;
export function setAsk(fake) {
  askOverride = fake;
}

function ask(system, user) {
  if (askOverride) return askOverride(system, user);
  const provider = PROVIDERS[PROVIDER];
  if (!provider) throw new Error(`Unknown LLM_PROVIDER "${PROVIDER}". Use "ollama" or "anthropic".`);
  return provider(system, user);
}

// Pulls the JSON object out of the model's reply, even if extra text slipped in.
export function parseScore(text) {
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) throw new Error("No JSON in model reply");
  const data = JSON.parse(match[0]);

  const score = Math.max(0, Math.min(100, Math.round(Number(data.score))));
  if (Number.isNaN(score)) throw new Error("Score is not a number");

  return {
    score,
    reasons: Array.isArray(data.reasons) ? data.reasons.slice(0, 3) : [],
    missing: Array.isArray(data.missing) ? data.missing.slice(0, 5) : [],
  };
}

export async function scoreJob(job, resume) {
  const description = (job.description || "No description provided.").slice(
    0,
    MAX_DESCRIPTION_CHARS
  );

  const user = `RESUME:\n${resume}\n\nJOB: ${job.title} at ${job.company} (${job.location})\n\nDESCRIPTION:\n${description}`;
  const text = await ask(SYSTEM_PROMPT, user);
  return parseScore(text);
}
