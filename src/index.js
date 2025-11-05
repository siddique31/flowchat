// src/index.js
import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./styles.css"; // ✅ Make sure this file exists and path is correct

// Get the root container
const container = document.getElementById("root");

// Create root and render app
const root = createRoot(container);

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Optional: Log build info in console (for debugging)
if (process.env.NODE_ENV === "production") {
  console.log("🚀 FlowChat running in production mode");
} else {
  console.log("🧩 FlowChat running in development mode");
}
