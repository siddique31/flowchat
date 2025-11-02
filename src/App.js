// src/App.js
import React from "react";
import ChatRoom from "./ChatRoom";
import "./styles.css";

function App() {
  return (
    <div className="App">
      <header className="header">
        <h1>💬 FlowChat — Real-time Chat</h1>
      </header>
      <ChatRoom />
      <footer className="footer">
        <p>© 2025 FlowChat by VirtualFlow Agency</p>
      </footer>
    </div>
  );
}

export default App;
