// src/App.js
import React from "react";
import ChatRoom from "./ChatRoom";
import "./styles.css"; // ✅ Make sure file name matches exactly (styles.css)

function App() {
  return (
    <div className="App">
      {/* 🔹 Header Section */}
      <header className="header">
        <h1>💬 FlowChat — Real-time Chat</h1>
      </header>

      {/* 🔹 Main Chat Room */}
      <main>
        <ChatRoom />
      </main>

      {/* 🔹 Footer Section */}
      <footer className="footer">
        <p>© {new Date().getFullYear()} FlowChat </p>
      </footer>
    </div>
  );
}

export default App;
