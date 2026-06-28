// lib/agentPermissions.js
// Least-privilege map for Work Hub's agents. Each agent may only read and
// write the window.storage keys it actually needs, and only perform the
// high-level capabilities it is trusted with.

// Per-agent storage permissions and capabilities.
//   read  — storage keys the agent may read
//   write — storage keys the agent may write
//   can   — high-level capabilities the agent is allowed to perform
export const AGENT_PERMISSIONS = {
  sage: {
    read: ["tasks", "items", "meetings", "capacity", "scroll_sage"],
    write: ["weekPlan", "taskDecompositions", "scroll_sage"],
    can: ["read", "write", "plan", "decompose"],
  },
  poppy: {
    read: ["tasks", "contacts", "communications", "scroll_poppy"],
    write: ["drafts", "communicationFlags", "scroll_poppy"],
    can: ["read", "write", "draft"],
  },
  hazel: {
    read: [
      "tasks",
      "items",
      "securityLog",
      "loginAttempts",
      "scroll_hazel",
    ],
    write: [
      "escalations",
      "agingItems",
      "minorAdjustments",
      "securityBriefing",
      "scroll_hazel",
    ],
    can: ["read", "write", "review", "escalate", "security"],
  },
  fern: {
    read: ["tasks", "items", "notes"],
    write: ["tasks", "items", "records", "poppyFlags", "hazelFlags"],
    can: ["read", "write", "extract", "flag"],
  },
  ivy: {
    read: ["scroll_sage", "scroll_poppy", "scroll_hazel", "scroll_rosie"],
    write: [
      "scroll_sage",
      "scroll_poppy",
      "scroll_hazel",
      "scroll_rosie",
      "proposals",
    ],
    can: ["read", "write", "synthesize", "research", "propose"],
  },
  rosie: {
    read: [
      "tasks",
      "items",
      "meetings",
      "reminders",
      "followups",
      "parked",
      "brainDump",
      "reflections",
      "scroll_rosie",
    ],
    write: ["scroll_rosie", "chat"],
    can: ["read", "write", "chat", "remember"],
  },
};

// Which model each agent runs on. Fast/cheap Haiku for the structured workers,
// Sonnet for the two that hold conversation and reasoning context.
export const AGENT_MODELS = {
  sage: "claude-haiku-4-5-20251001",
  poppy: "claude-haiku-4-5-20251001",
  hazel: "claude-haiku-4-5-20251001",
  fern: "claude-haiku-4-5-20251001",
  ivy: "claude-sonnet-4-6",
  rosie: "claude-sonnet-4-6",
};

// Does this agent have the given capability?
//   action "read" / "write" → true if the agent has any keys of that kind
//   any other action        → true if it is listed in the agent's `can`
export function agentCan(agentName, action) {
  const perms = AGENT_PERMISSIONS[(agentName || "").toLowerCase()];
  if (!perms) return false;

  if (action === "read") return perms.read.length > 0;
  if (action === "write") return perms.write.length > 0;

  return Array.isArray(perms.can) && perms.can.includes(action);
}

// May this agent touch this storage key? Defaults to checking write access
// (the dangerous direction); pass mode "read" to check reads instead.
// Returns a structured verdict so callers can log the reason.
export function validateAgentAction(agentName, storageKey, mode = "write") {
  const agent = (agentName || "").toLowerCase();
  const perms = AGENT_PERMISSIONS[agent];

  if (!perms) {
    return {
      allowed: false,
      agent,
      key: storageKey,
      mode,
      reason: `Unknown agent "${agentName}".`,
    };
  }

  const list = mode === "read" ? perms.read : perms.write;
  const allowed = list.includes(storageKey);

  return {
    allowed,
    agent,
    key: storageKey,
    mode,
    reason: allowed
      ? `"${agent}" may ${mode} "${storageKey}".`
      : `"${agent}" is not permitted to ${mode} "${storageKey}".`,
  };
}

export default AGENT_PERMISSIONS;
