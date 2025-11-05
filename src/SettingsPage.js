// src/SettingsPage.js
import React, { useState } from "react";

export default function SettingsPage() {
  const [darkMode, setDarkMode] = useState(false);

  const toggleTheme = () => {
    setDarkMode(!darkMode);
    document.body.dataset.theme = !darkMode ? "dark" : "light";
  };

  return (
    <div className="page-container">
      <h2>Settings</h2>
      <div className="settings-item">
        <label>
          <input
            type="checkbox"
            checked={darkMode}
            onChange={toggleTheme}
          />
          Dark Mode
        </label>
      </div>
    </div>
  );
}
