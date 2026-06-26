// storage-shim.js
// Work Hub was built for the Claude artifact sandbox, where window.storage
// exists. In a real browser it doesn't, so this backs window.storage with
// localStorage using the SAME async get/set/delete/list interface the app
// already calls. Computer-only: data lives in this browser on this machine.
// Loaded before the app (see main.jsx), and it no-ops if window.storage
// already exists, so it never clobbers the real sandbox version.

if (typeof window !== "undefined" && !window.storage) {
  const PREFIX = "workhub:";
  window.storage = {
    async get(key) {
      const v = localStorage.getItem(PREFIX + key);
      return v === null ? null : { key, value: v };
    },
    async set(key, value) {
      localStorage.setItem(PREFIX + key, value);
      return { key, value };
    },
    async delete(key) {
      localStorage.removeItem(PREFIX + key);
      return { key, deleted: true };
    },
    async list(prefix = "") {
      const keys = [];
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && k.startsWith(PREFIX + prefix)) keys.push(k.slice(PREFIX.length));
      }
      return { keys };
    },
  };
}
