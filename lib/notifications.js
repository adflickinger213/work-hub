// lib/notifications.js — push + local notification helpers.
//
// requestPermission()        — ask for notification permission + subscribe to push.
// scheduleTaskReminder(task) — fire a reminder 15 min before a task's start.
// scheduleHazelAlert(esc)    — fire an immediate alert for an escalation.
// cancelReminder(taskId)     — cancel a scheduled task reminder.
//
// VAPID public key comes from the build env (VITE_VAPID_PUBLIC_KEY).

const VAPID_PUBLIC_KEY =
  (typeof import.meta !== "undefined" && import.meta.env && import.meta.env.VITE_VAPID_PUBLIC_KEY) ||
  "";

// taskId -> setTimeout handle, so reminders can be cancelled.
const scheduled = new Map();

function urlBase64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(base64);
  const out = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) out[i] = raw.charCodeAt(i);
  return out;
}

async function getRegistration() {
  if (!("serviceWorker" in navigator)) return null;
  try {
    return await navigator.serviceWorker.ready;
  } catch {
    return null;
  }
}

function notify(title, options) {
  return getRegistration().then((reg) => {
    if (reg) return reg.showNotification(title, options);
    if (typeof Notification !== "undefined" && Notification.permission === "granted") {
      // eslint-disable-next-line no-new
      new Notification(title, options);
    }
    return null;
  });
}

/**
 * requestPermission()
 * Requests notification permission and, if granted, subscribes to push and
 * registers the subscription with the server. Returns true on success.
 */
export async function requestPermission() {
  try {
    if (typeof Notification === "undefined") return false;
    const perm = await Notification.requestPermission();
    if (perm !== "granted") return false;

    const reg = await getRegistration();
    if (reg && reg.pushManager && VAPID_PUBLIC_KEY) {
      try {
        const sub = await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
        });
        await fetch("/api/push-subscribe", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "same-origin",
          body: JSON.stringify(sub),
        });
      } catch (err) {
        // Push subscription is best-effort; local notifications still work.
        console.warn("[work-hub] push subscribe failed:", err?.message ?? err);
      }
    }
    return true;
  } catch (err) {
    console.error("[work-hub] requestPermission failed:", err?.message ?? err);
    return false;
  }
}

/**
 * scheduleTaskReminder(task)
 * Schedules a notification 15 minutes before task.scheduledTime (an ISO string
 * or epoch ms). No-op if the time is missing or already within 15 minutes.
 */
export function scheduleTaskReminder(task) {
  try {
    if (!task) return false;
    const when = new Date(task.scheduledTime || task.startTime || task.when).getTime();
    if (!Number.isFinite(when)) return false;
    const fireAt = when - 15 * 60 * 1000;
    const delay = fireAt - Date.now();
    if (delay <= 0) return false;

    cancelReminder(task.id);
    const handle = setTimeout(() => {
      notify("Coming up in 15 minutes", {
        body: task.title || task.name || "A task is starting soon.",
        icon: "/icon-192.svg",
        tag: `task-${task.id}`,
        data: { taskId: task.id },
      });
      scheduled.delete(task.id);
    }, delay);
    scheduled.set(task.id, handle);
    return true;
  } catch (err) {
    console.error("[work-hub] scheduleTaskReminder failed:", err?.message ?? err);
    return false;
  }
}

/**
 * scheduleHazelAlert(escalation)
 * Fires an immediate notification for a Hazel escalation.
 */
export function scheduleHazelAlert(escalation) {
  try {
    const body =
      (escalation && (escalation.summary || escalation.note)) ||
      "Hazel flagged something that needs your attention.";
    return notify("Hazel has a heads-up", {
      body,
      icon: "/icon-192.svg",
      tag: "hazel-alert",
      data: { taskId: escalation?.taskId || null },
    });
  } catch (err) {
    console.error("[work-hub] scheduleHazelAlert failed:", err?.message ?? err);
    return null;
  }
}

/**
 * cancelReminder(taskId)
 * Cancels a scheduled task reminder.
 */
export function cancelReminder(taskId) {
  const handle = scheduled.get(taskId);
  if (handle) {
    clearTimeout(handle);
    scheduled.delete(taskId);
    return true;
  }
  return false;
}
