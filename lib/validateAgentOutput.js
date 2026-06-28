// lib/validateAgentOutput.js
// Validation utilities for agent responses.
// validateAgentOutput — checks that an agent's parsed output matches an expected schema.
// validateAnthropicResponse — checks that a raw Anthropic API response is well-formed
//   before trying to extract content from it.

/**
 * validateAnthropicResponse(data)
 * Confirms that `data` is a well-formed Anthropic messages response.
 * Returns { ok: true, text } on success or { ok: false, error } on failure.
 *
 * @param {unknown} data - The JSON-parsed response body from Anthropic.
 * @returns {{ ok: boolean, text?: string, error?: string }}
 */
export function validateAnthropicResponse(data) {
  if (!data || typeof data !== "object") {
    return { ok: false, error: "Response is not an object." };
  }

  if (data.error) {
    const msg = data.error.message || JSON.stringify(data.error);
    return { ok: false, error: `Anthropic error: ${msg}` };
  }

  if (!Array.isArray(data.content)) {
    return { ok: false, error: "Response missing content array." };
  }

  const block = data.content.find((b) => b && b.type === "text");
  if (!block) {
    return { ok: false, error: "Response has no text content block." };
  }

  if (typeof block.text !== "string" || block.text.trim() === "") {
    return { ok: false, error: "Response text block is empty." };
  }

  return { ok: true, text: block.text };
}

/**
 * validateAgentOutput(parsed, schema)
 * Validates a parsed agent output object against a field schema.
 *
 * `schema` is an array of field descriptors:
 *   { key: string, type: string, required?: boolean, arrayOf?: string }
 *
 * Returns { ok: true } on success or { ok: false, errors: string[] } on failure.
 *
 * @param {unknown} parsed     - The parsed output (should be an object).
 * @param {Array<{key: string, type: string, required?: boolean, arrayOf?: string}>} schema
 * @returns {{ ok: boolean, errors?: string[] }}
 */
export function validateAgentOutput(parsed, schema) {
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    return { ok: false, errors: ["Parsed output is not a plain object."] };
  }

  if (!Array.isArray(schema) || schema.length === 0) {
    return { ok: true }; // nothing to validate
  }

  const errors = [];

  for (const field of schema) {
    const { key, type, required = true, arrayOf } = field;
    const value = parsed[key];

    if (value === undefined || value === null) {
      if (required) {
        errors.push(`Missing required field: "${key}".`);
      }
      continue;
    }

    if (type === "array") {
      if (!Array.isArray(value)) {
        errors.push(`Field "${key}" must be an array (got ${typeof value}).`);
        continue;
      }
      if (arrayOf) {
        const bad = value.filter((item) => typeof item !== arrayOf);
        if (bad.length > 0) {
          errors.push(`Field "${key}" items must be ${arrayOf} (found ${bad.length} invalid).`);
        }
      }
    } else {
      if (typeof value !== type) {
        errors.push(`Field "${key}" must be ${type} (got ${typeof value}).`);
      }
    }
  }

  if (errors.length > 0) {
    return { ok: false, errors };
  }

  return { ok: true };
}
