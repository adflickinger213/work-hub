// api/push-subscribe.js — receives a Web Push subscription from the client and
// stores it. The store is in-memory only (a module-level Map), so it does NOT
// survive cold starts and is per-instance.
//
// PRODUCTION NOTE: a real deployment must persist subscriptions in a shared
// database (and key sends with VAPID_PRIVATE_KEY). This in-memory store is a
// placeholder so the client flow works end to end in development.

import { requireSession } from "../lib/auth.js";

// endpoint -> subscription object
const subscriptions = new Map();

// Real push endpoints are always https URLs issued by a browser push service.
// Rejecting anything else keeps junk out of the store and blocks the server
// from ever being pointed at internal/plaintext targets when sends land.
function isHttpsUrl(value) {
  try {
    return new URL(value).protocol === "https:";
  } catch {
    return false;
  }
}

function isValidSubscription(sub) {
  return (
    sub &&
    typeof sub === "object" &&
    typeof sub.endpoint === "string" &&
    isHttpsUrl(sub.endpoint) &&
    sub.keys &&
    typeof sub.keys === "object" &&
    typeof sub.keys.p256dh === "string" &&
    typeof sub.keys.auth === "string"
  );
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ ok: false, error: "method_not_allowed" });
    return;
  }

  // Only logged-in clients may register a subscription.
  if (!requireSession(req)) {
    res.status(401).json({ ok: false, error: "not_authorized" });
    return;
  }

  const sub = req.body || {};
  if (!isValidSubscription(sub)) {
    res.status(400).json({ ok: false, error: "invalid_subscription" });
    return;
  }

  subscriptions.set(sub.endpoint, sub);
  res.status(200).json({ ok: true });
}
