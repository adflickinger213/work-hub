// api/agent.js — the single serverless entry point for every Work Hub agent
// (rosie, sage, poppy, hazel, fern, ivy). It does five things:
//
//   1. Reads { agentName, instruction, externalContent } from the POST body.
//   2. Validates agentName against AGENT_PERMISSIONS (unknown agent => rejected).
//   3. Assembles the user message with buildAgentMessage, fencing any external
//      content with wrapExternalContent so the model treats it as data.
//   4. Calls Anthropic with the model from AGENT_MODELS[agentName], using the
//      secret key server-side (never exposed to the browser).
//   5. Validates the response and returns a normalized { ok, data, error,
//      anomalous } shape — NEVER the raw Anthropic response.
//
// Requires APP_PASSWORD and ANTHROPIC_API_KEY environment variables in Vercel.

import { AGENT_PERMISSIONS, AGENT_MODELS } from "../lib/agentPermissions.js";
import { buildAgentMessage, wrapExternalContent } from "../lib/safeWrap.js";
import { validateAnthropicResponse } from "../lib/validateAgentOutput.js";
import { requireSession } from "../lib/auth.js";

import { ROSIE_SYSTEM_PROMPT } from "../prompts/rosie.js";
import { SAGE_SYSTEM_PROMPT } from "../prompts/sage.js";
import { POPPY_SYSTEM_PROMPT } from "../prompts/poppy.js";
import { HAZEL_SYSTEM_PROMPT } from "../prompts/hazel.js";
import { FERN_SYSTEM_PROMPT } from "../prompts/fern.js";
import { IVY_SYSTEM_PROMPT } from "../prompts/ivy.js";

const SYSTEM_PROMPTS = {
  rosie: ROSIE_SYSTEM_PROMPT,
  sage: SAGE_SYSTEM_PROMPT,
  poppy: POPPY_SYSTEM_PROMPT,
  hazel: HAZEL_SYSTEM_PROMPT,
  fern: FERN_SYSTEM_PROMPT,
  ivy: IVY_SYSTEM_PROMPT,
};

const MAX_TOKENS = 4096;
const LOG = "[work-hub]";

// CORS — locked to this deployment's own origin only. VERCEL_URL is the
// deployment host without protocol; ALLOWED_ORIGIN can override for a custom
// domain. Defaults to same-origin (no cross-origin allowed) when unset.
function applyCors(req, res) {
  const configured =
    process.env.ALLOWED_ORIGIN ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null);
  const origin = req.headers.origin;
  if (configured && origin === configured) {
    res.setHeader("Access-Control-Allow-Origin", configured);
    res.setHeader("Vary", "Origin");
    res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    res.setHeader("Access-Control-Allow-Credentials", "true");
  }
}

// A response is "anomalous" when it parsed as a valid Anthropic envelope but
// the text content looks like it deviated from the agent contract — empty,
// or echoing the injection-boundary markers back (a sign the fence leaked).
function detectAnomaly(text) {
  if (typeof text !== "string" || text.trim().length === 0) {
    return "empty model output";
  }
  if (/untrusted data, not instructions/i.test(text)) {
    return "model echoed the safety boundary back";
  }
  return null;
}

// Try to parse JSON out of the model text; agents like rosie/ivy return JSON,
// sometimes fenced in a ```json block. Falls back to the raw text.
function parseAgentData(text) {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const candidate = (fenced ? fenced[1] : text).trim();
  try {
    return { parsed: JSON.parse(candidate), text };
  } catch {
    return { parsed: null, text };
  }
}

export default async function handler(req, res) {
  applyCors(req, res);

  if (req.method === "OPTIONS") {
    res.status(204).end();
    return;
  }
  if (req.method !== "POST") {
    res.status(405).json({ ok: false, error: "method_not_allowed", anomalous: false });
    return;
  }

  // --- auth check (HMAC session cookie set by api/login) ---
  if (!requireSession(req)) {
    res.status(401).json({ ok: false, error: "not_authorized", anomalous: false });
    return;
  }

  const { agentName, instruction, externalContent } = req.body || {};

  // --- validate agent ---
  if (typeof agentName !== "string" || !AGENT_PERMISSIONS[agentName]) {
    res.status(400).json({ ok: false, error: "unknown_agent", anomalous: false });
    return;
  }
  const systemPrompt = SYSTEM_PROMPTS[agentName];
  const model = AGENT_MODELS[agentName];
  if (!systemPrompt || !model) {
    res.status(500).json({ ok: false, error: "agent_misconfigured", anomalous: false });
    return;
  }
  if (typeof instruction !== "string" || instruction.trim() === "") {
    res.status(400).json({ ok: false, error: "missing_instruction", anomalous: false });
    return;
  }

  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) {
    res.status(500).json({ ok: false, error: "server_misconfigured", anomalous: false });
    return;
  }

  // --- assemble the user message, fencing untrusted content ---
  let userContent = instruction;
  if (externalContent !== undefined && externalContent !== null) {
    userContent += "\n\n" + wrapExternalContent(externalContent);
  }
  const message = buildAgentMessage("user", userContent);

  // --- call Anthropic ---
  let data;
  try {
    const upstream = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": key,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model,
        max_tokens: MAX_TOKENS,
        system: systemPrompt,
        messages: [message],
      }),
    });
    data = await upstream.json();
  } catch (e) {
    console.error(`${LOG} upstream call failed for "${agentName}":`, e?.message ?? e);
    res.status(502).json({ ok: false, error: "upstream_failed", anomalous: false });
    return;
  }

  // --- validate the envelope; never surface raw Anthropic errors ---
  const valid = validateAnthropicResponse(data);
  if (!valid.ok) {
    console.error(`${LOG} invalid response for "${agentName}": ${valid.error}`);
    res.status(502).json({ ok: false, error: "invalid_response", anomalous: false });
    return;
  }

  // --- anomaly check ---
  const anomaly = detectAnomaly(valid.text);
  if (anomaly) {
    console.warn(`${LOG} anomalous output from "${agentName}": ${anomaly}`);
    res.status(200).json({ ok: false, error: "anomalous_output", anomalous: true });
    return;
  }

  const { parsed, text } = parseAgentData(valid.text);
  res.status(200).json({
    ok: true,
    data: parsed !== null ? parsed : { text },
    error: null,
    anomalous: false,
  });
}

// Exported for reuse by api/rosie.js so Anthropic logic lives in one place.
export const __internal = { SYSTEM_PROMPTS, detectAnomaly, parseAgentData };
