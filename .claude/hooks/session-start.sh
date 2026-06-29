#!/bin/bash
# SessionStart hook — installs dependencies so the verify gate and tests work
# the moment a Claude Code on the web session opens on a fresh clone.
#
# Why this exists: a web/codespace session starts from a clean git clone with no
# node_modules (it's gitignored). Without this, the first `npm run ship` / `npm
# test` fails with "Cannot find package '@babel/parser'" and looks like a broken
# script when it's really just missing setup. This installs deps up front.
set -euo pipefail

# Only auto-install in the remote (web) environment. Local devs manage their own
# node_modules; remove this guard if you want it to run everywhere.
if [ "${CLAUDE_CODE_REMOTE:-}" != "true" ]; then
  exit 0
fi

cd "${CLAUDE_PROJECT_DIR:-.}"

# Idempotent: safe to run every session. `install` (not `ci`) reuses the cached
# container layer efficiently. Browsers for the smoke test are pre-provisioned,
# so we never run `playwright install` here.
echo "[session-start] installing npm dependencies..."
npm install --no-audit --no-fund
echo "[session-start] done."
