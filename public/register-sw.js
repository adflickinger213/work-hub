// register-sw.js — external (CSP-friendly) service worker registration.
// Kept out of index.html so the Content-Security-Policy can forbid inline
// scripts entirely.
if ("serviceWorker" in navigator) {
  window.addEventListener("load", function () {
    navigator.serviceWorker.register("/sw.js").catch(function (err) {
      console.warn("[work-hub] SW registration failed:", err);
    });
  });
}
