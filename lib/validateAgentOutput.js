// lib/validateAgentOutput.js
// Validation gate for agent (Sage/Poppy/Hazel/Fern/Ivy) JSON output.
//
// Two entry points:
//   validateAgentOutput(rawResponse, agentName)      — validate a raw string
//   validateAnthropicResponse(apiResponse, agentName) — pull text out of an
//     Anthropic Messages API response, then validate it
//
// Both return a uniform shape:
//   { ok, data, error, anomalous, raw }

// Keys each JSON-emitting agent MUST include at the top level.
const REQUIRED_KEYS = {
  sage: ["weekPlan", "taskDecompositions", "capacityNotes", "sageNote"],
  poppy: ["drafts", "communicationFlags"],
  hazel: ["minorAdjustments", "escalations", "agingItems"],
  fern: ["action"],
  ivy: ["scrollUpdates", "conflicts"],
};

// The primary "action" array we watch per agent, with an expected baseline
// count. If a response carries more than 3x the baseline we mark it
// anomalous (likely a runaway / hijacked agent) without rejecting it outright.
const ANOMALY_BASELINES = {
  sage: { field: "taskDecompositions", baseline: 8 },
  poppy: { field: "drafts", baseline: 5 },
  hazel: { field: "escalations", baseline: 3 },
  fern: { field: "newSubtask", baseline: 3 },
  ivy: { field: "conflicts", baseline: 5 },
};

// Count the "size" of an action field: array length, object key count, or 1
// for a present scalar/object, 0 for null/undefined.
function countField(value) {
  if (value === null || value === undefined) return 0;
  if (Array.isArray(value)) return value.length;
  if (typeof value === "object") return Object.keys(value).length;
  return 1;
}

// Strip ```json ... ``` (or bare ```) fences and surrounding whitespace, then
// fall back to slicing from the first { or [ to the last } or ] so a little
// chatter around the JSON doesn't break parsing.
function stripFences(raw) {
  if (typeof raw !== "string") return "";
  let s = raw.trim();

  const fence = s.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/i);
  if (fence) s = fence[1].trim();

  if (s[0] !== "{" && s[0] !== "[") {
    const firstObj = s.indexOf("{");
    const firstArr = s.indexOf("[");
    const candidates = [firstObj, firstArr].filter((i) => i >= 0);
    if (candidates.length) {
      const start = Math.min(...candidates);
      const lastObj = s.lastIndexOf("}");
      const lastArr = s.lastIndexOf("]");
      const end = Math.max(lastObj, lastArr);
      if (end > start) s = s.slice(start, end + 1);
    }
  }
  return s;
}

export function validateAgentOutput(rawResponse, agentName) {
  const raw = typeof rawResponse === "string" ? rawResponse : "";
  const result = { ok: false, data: null, error: null, anomalous: false, raw };

  const agent = (agentName || "").toLowerCase();

  // Parse JSON (after stripping fences).
  let data;
  try {
    const cleaned = stripFences(raw);
    if (!cleaned) {
      result.error = "Empty response — nothing to parse.";
      return result;
    }
    data = JSON.parse(cleaned);
  } catch (e) {
    result.error = `JSON parse failed: ${e.message}`;
    return result;
  }

  if (data === null || typeof data !== "object") {
    result.error = "Parsed value is not an object.";
    return result;
  }

  // Required-key check for known JSON agents. Unknown agents (e.g. rosie,
  // which speaks prose) parse-and-pass without key requirements.
  const required = REQUIRED_KEYS[agent];
  if (required) {
    const missing = required.filter((k) => !(k in data));
    if (missing.length) {
      result.data = data;
      result.error = `Missing required key(s): ${missing.join(", ")}`;
      return result;
    }
  }

  // Anomaly check: primary action field more than 3x its baseline.
  const anom = ANOMALY_BASELINES[agent];
  if (anom) {
    const count = countField(data[anom.field]);
    if (count > anom.baseline * 3) {
      result.anomalous = true;
    }
  }

  result.ok = true;
  result.data = data;
  return result;
}

// Pull the text out of an Anthropic Messages API response and validate it.
// Accepts the raw response object: { content: [{ type: "text", text }, ...] }.
export function validateAnthropicResponse(apiResponse, agentName) {
  const base = { ok: false, data: null, error: null, anomalous: false, raw: "" };

  if (!apiResponse || typeof apiResponse !== "object") {
    return { ...base, error: "No API response object." };
  }

  // Surface an API-level error before trying to read content.
  if (apiResponse.error) {
    const msg =
      typeof apiResponse.error === "string"
        ? apiResponse.error
        : apiResponse.error.message || "Unknown API error.";
    return { ...base, error: `API error: ${msg}` };
  }

  const blocks = Array.isArray(apiResponse.content) ? apiResponse.content : [];
  const text = blocks
    .filter((b) => b && b.type === "text" && typeof b.text === "string")
    .map((b) => b.text)
    .join("")
    .trim();

  if (!text) {
    return { ...base, error: "No text content in API response." };
  }

  return validateAgentOutput(text, agentName);
}

export default validateAgentOutput;
