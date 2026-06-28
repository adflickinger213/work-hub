// lib/agentPermissions.js
// Agent permissions and model configuration for Work Hub.
//
// AGENT_PERMISSIONS — what each named agent is allowed to do.
// AGENT_MODELS      — which Anthropic model each agent uses.
// agentCan(agent, action) — returns true if the agent has the given permission.
// validateAgentAction(agent, action) — throws if the action is not permitted.

/**
 * Permission flags for each agent.
 * Each key is an agent name; the value is an array of allowed action strings.
 *
 * Defined actions:
 *   "read"         — may read app state (tasks, roadmap, meetings, etc.)
 *   "write"        — may suggest writes or mutations to app state
 *   "roadmap"      — may generate or modify the daily roadmap
 *   "reflection"   — may run end-of-day reflection flows
 *   "triage"       — may perform task/priority triage
 *   "planning"     — may perform strategic or milestone planning
 *   "structure"    — may audit, reorganize, or create system templates
 *   "energy"       — may run energy/momentum support flows
 *   "grounding"    — may run grounding and overwhelm-recovery flows
 */
export const AGENT_PERMISSIONS = {
  rosie:  ["read", "write", "roadmap", "reflection"],
  sage:   ["read", "planning", "triage"],
  poppy:  ["read", "energy"],
  hazel:  ["read", "grounding"],
  fern:   ["read", "reflection"],
  ivy:    ["read", "write", "structure", "triage"],
};

/**
 * Anthropic model assigned to each agent.
 * Agents with heavier workloads (roadmap generation, planning) use
 * the full claude-sonnet model; lighter agents may use a faster tier.
 * Change these as new model versions become available.
 */
export const AGENT_MODELS = {
  rosie:  "claude-sonnet-4-6",
  sage:   "claude-sonnet-4-6",
  poppy:  "claude-sonnet-4-6",
  hazel:  "claude-sonnet-4-6",
  fern:   "claude-sonnet-4-6",
  ivy:    "claude-sonnet-4-6",
};

/**
 * agentCan(agent, action)
 * Returns true if the named agent has the given permission, false otherwise.
 * Unknown agents always return false.
 *
 * @param {string} agent  - Agent name (e.g. "rosie").
 * @param {string} action - Permission string (e.g. "roadmap").
 * @returns {boolean}
 */
export function agentCan(agent, action) {
  const perms = AGENT_PERMISSIONS[agent];
  if (!Array.isArray(perms)) return false;
  return perms.includes(action);
}

/**
 * validateAgentAction(agent, action)
 * Throws an Error if the named agent does not have the given permission.
 * Use this as a guard at the start of any agent-dispatched operation.
 *
 * @param {string} agent  - Agent name.
 * @param {string} action - Permission string.
 * @throws {Error} if the action is not permitted for this agent.
 */
export function validateAgentAction(agent, action) {
  if (!agentCan(agent, action)) {
    throw new Error(
      `Agent "${agent}" does not have permission to perform "${action}".`
    );
  }
}
