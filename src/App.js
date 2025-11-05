import React, { useState, useEffect } from "react";
import ChatRoom from "./ChatRoom";
import "./styles.css";

function App() {
  const [theme, setTheme] = useState("light");

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  return (
    <div className="App">
      <header className="header">
        <h1>💬 FlowChat — Real-time Chat</h1>
        <button onClick={toggleTheme}>
          {theme === "light" ? "🌙 Dark Mode" : "☀️ Light Mode"}
        </button>
      </header>

      <ChatRoom />

      <footer className="footer">
        <p>© 2025 FlowChat by VirtualFlow Agency</p>
      </footer>
    </div>
  );
}

export default App;
