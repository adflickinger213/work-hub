// api/rosie.js — compatibility shim for Rosie.
//
// Anthropic logic now lives in one place: api/agent.js. This route no longer
// talks to Anthropic itself. It translates the older Rosie request shape
// ({ model, max_tokens, system, messages }) into an agent call, delegates to
// the agent handler, and then re-wraps the agent's normalized { ok, data }
// response back into the raw Anthropic envelope ({ content: [{ type, text }] })
// that the existing app code parses. That keeps every old /api/rosie caller
// working unchanged while routing through the single agent endpoint.
//
// New code should call /api/agent with { agentName: "rosie", instruction,
// externalContent } directly.

import agentHandler from "./agent.js";

// Pull the freshest user text out of an Anthropic-style messages array.
function lastUserText(messages) {
  if (!Array.isArray(messages)) return "";
  for (let i = messages.length - 1; i >= 0; i--) {
    const m = messages[i];
    if (m && m.role === "user") {
      if (typeof m.content === "string") return m.content;
      if (Array.isArray(m.content)) {
        const block = m.content.find((b) => b && b.type === "text");
        if (block) return block.text || "";
      }
    }
  }
  return "";
}

// Turn the agent's normalized data back into a plain text string. JSON agents
// (roadmaps, parsers) get re-serialized so the caller's JSON.parse still works;
// plain-text replies pass through.
function dataToText(data) {
  if (data && typeof data === "object") {
    const keys = Object.keys(data);
    if (keys.length === 1 && typeof data.text === "string") return data.text;
    try {
      return JSON.stringify(data);
    } catch {
      return String(data.text ?? "");
    }
  }
  return typeof data === "string" ? data : "";
}

// Minimal capturing response so we can read what the agent handler produced
// and reshape it before sending the real response.
function makeCapture() {
  const cap = { statusCode: 200, body: null, headers: {} };
  return {
    cap,
    res: {
      setHeader(k, v) {
        cap.headers[k] = v;
      },
      status(code) {
        cap.statusCode = code;
        return this;
      },
      json(payload) {
        cap.body = payload;
        return this;
      },
      end() {
        return this;
      },
    },
  };
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const body = req.body || {};
  // Map the legacy shape onto the agent contract.
  req.body = {
    agentName: "rosie",
    instruction: body.instruction || lastUserText(body.messages) || "",
    externalContent: body.externalContent,
  };

  const { cap, res: capRes } = makeCapture();
  await agentHandler(req, capRes);

  // Pass through any cookies/headers the agent set (e.g. CORS).
  for (const [k, v] of Object.entries(cap.headers)) res.setHeader(k, v);

  const payload = cap.body || {};
  if (payload.ok) {
    // Re-wrap into the raw Anthropic envelope the app expects.
    res.status(200).json({
      content: [{ type: "text", text: dataToText(payload.data) }],
    });
    return;
  }

  // Failure / anomaly: surface a non-2xx so existing callers fall into their
  // catch/!res.ok branches, without leaking internals.
  const code = cap.statusCode >= 400 ? cap.statusCode : 502;
  res.status(code).json({ error: payload.error || "rosie_unavailable" });
}
