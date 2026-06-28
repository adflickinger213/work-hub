// api/rosie.js — compatibility shim for Rosie.
//
// Anthropic logic now lives in one place: api/agent.js. This route used to
// proxy directly to Anthropic; it now translates the older Rosie request shape
// ({ model, max_tokens, system, messages }) into an agent call and delegates,
// so there's no duplicated key handling, auth, or validation here.
//
// New code should call /api/agent with { agentName: "rosie", instruction,
// externalContent } directly. This shim stays for anything still pointed here.

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

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ ok: false, error: "method_not_allowed" });
    return;
  }

  const body = req.body || {};
  // Map the legacy shape onto the agent contract and delegate.
  req.body = {
    agentName: "rosie",
    instruction: body.instruction || lastUserText(body.messages) || "",
    externalContent: body.externalContent,
  };

  return agentHandler(req, res);
}
