// lib/safeWrap.js
// Safe async wrapper and message-building utilities for agent calls.
//
// safeWrap(fn, fallback) — wraps an async function; on error returns fallback.
// buildAgentMessage(role, content) — builds a well-formed Anthropic message object.
// AGENT_SCHEMAS — field schemas for each agent's expected output shape.

/**
 * safeWrap(fn, fallback)
 * Wraps an async function so it never throws to the caller.
 * On success, returns the function's resolved value.
 * On any error, logs the error and returns `fallback`.
 *
 * @template T
 * @param {() => Promise<T>} fn         - Async function to execute.
 * @param {T}                fallback   - Value to return on failure.
 * @returns {Promise<T>}
 */
export async function safeWrap(fn, fallback) {
  try {
    return await fn();
  } catch (err) {
    console.error("[safeWrap] caught error:", err?.message ?? err);
    return fallback;
  }
}

/**
 * buildAgentMessage(role, content)
 * Builds a single message object in the format Anthropic's messages API expects.
 * Role must be "user" or "assistant".
 *
 * @param {"user" | "assistant"} role    - The speaker role.
 * @param {string}               content - The message text.
 * @returns {{ role: string, content: string }}
 */
export function buildAgentMessage(role, content) {
  if (role !== "user" && role !== "assistant") {
    throw new Error(
      `buildAgentMessage: role must be "user" or "assistant" (got "${role}").`
    );
  }
  if (typeof content !== "string" || content.trim() === "") {
    throw new Error("buildAgentMessage: content must be a non-empty string.");
  }
  return { role, content };
}

/**
 * AGENT_SCHEMAS
 * Expected output field schemas for each agent, used with validateAgentOutput.
 *
 * Each schema is an array of field descriptors:
 *   { key, type, required?, arrayOf? }
 *
 * "rosie" and "ivy" return structured JSON; others return freeform text
 * and have empty schemas (no structured validation needed).
 */
export const AGENT_SCHEMAS = {
  rosie: [
    { key: "slots",   type: "array",  required: true,  arrayOf: "object" },
    { key: "summary", type: "string", required: false },
    { key: "flags",   type: "array",  required: false, arrayOf: "string" },
  ],
  sage: [],
  poppy: [],
  hazel: [],
  fern: [],
  ivy: [
    { key: "categories", type: "array",  required: false, arrayOf: "object" },
    { key: "gaps",       type: "array",  required: false, arrayOf: "string" },
    { key: "templates",  type: "array",  required: false, arrayOf: "object" },
  ],
};
