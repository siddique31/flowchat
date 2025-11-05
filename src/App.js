// src/App.js
import React, { useState } from "react";
import ChatRoom from "./ChatRoom";
import ProfilePage from "./ProfilePage";
import FriendsList from "./FriendsList";
import SettingsPage from "./SettingsPage";
import StatusPage from "./StatusPage";
import "./styles.css";

export default function App() {
  const [activePage, setActivePage] = useState("chat"); // default page

  return (
    <div className="App">
      <header className="header">
        <h1>💬 FlowChat — Real-time Chat</h1>
        <nav className="nav-bar">
          <button onClick={() => setActivePage("chat")}>Chat</button>
          <button onClick={() => setActivePage("status")}>Status</button>
          <button onClick={() => setActivePage("friends")}>Friends</button>
          <button onClick={() => setActivePage("profile")}>Profile</button>
          <button onClick={() => setActivePage("settings")}>Settings</button>
        </nav>
      </header>

      <main>
        {activePage === "chat" && <ChatRoom />}
        {activePage === "status" && <StatusPage />}
        {activePage === "friends" && <FriendsList />}
        {activePage === "profile" && <ProfilePage />}
        {activePage === "settings" && <SettingsPage />}
      </main>

      <footer className="footer">
        <p>© 2025 FlowChat by VirtualFlow Agency</p>
      </footer>
    </div>
  );
}
