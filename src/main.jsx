// main.jsx — the entry point Vite uses to boot the app in a real browser.
// Order matters: the storage shim must run BEFORE the app so window.storage
// exists when the app's code first touches it.
import "./storage-shim.js";
import React from "react";
import ReactDOM from "react-dom/client";
import App from "../dist/work-hub.bundle.jsx";

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
