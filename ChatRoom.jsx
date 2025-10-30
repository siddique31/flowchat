import React, { useEffect, useState } from "react";
import { supabase } from "./supabaseClient";
import "./App.css";

function ChatRoom({ session }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [onlineUsers, setOnlineUsers] = useState([]);

  // 🟣 Fetch messages + online users
  useEffect(() => {
    fetchMessages();
    fetchOnlineUsers();
    markUserOnline();

    // 🔄 Subscribe to new messages
    const msgChannel = supabase
      .channel("public:messages")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages" }, (payload) => {
        setMessages((prev) => [...prev, payload.new]);
      })
      .subscribe();

    // 🔄 Subscribe to online users changes
    const onlineChannel = supabase
      .channel("public:online_users")
      .on("postgres_changes", { event: "*", schema: "public", table: "online_users" }, () => {
        fetchOnlineUsers();
      })
      .subscribe();

    // Mark user offline when leaving
    const handleUnload = () => markUserOffline();
    window.addEventListener("beforeunload", handleUnload);

    return () => {
      supabase.removeChannel(msgChannel);
      supabase.removeChannel(onlineChannel);
      handleUnload();
      window.removeEventListener("beforeunload", handleUnload);
    };
  }, []);

  async function fetchMessages() {
    const { data } = await supabase
      .from("messages")
      .select("*")
      .order("created_at", { ascending: true });
    setMessages(data || []);
  }

  async function fetchOnlineUsers() {
    const { data } = await supabase.from("online_users").select("*");
    setOnlineUsers(data || []);
  }

  async function markUserOnline() {
    const { user } = session;
    await supabase.from("online_users").upsert({
      user_id: user.id,
      email: user.email,
      status: "online",
      last_seen: new Date(),
    });
  }

  async function markUserOffline() {
    const { user } = session;
    await supabase.from("online_users").upsert({
      user_id: user.id,
      email: user.email,
      status: "offline",
      last_seen: new Date(),
    });
  }

  async function sendMessage(e) {
    e.preventDefault();
    if (newMessage.trim() === "") return;

    const { user } = session;
    await supabase.from("messages").insert([
      {
        content: newMessage,
        user_email: user.email,
      },
    ]);

    setNewMessage("");
  }

  return (
    <div className="chat-container" style={{ display: "flex", gap: "20px" }}>
      {/* 🟢 Sidebar for online users */}
      <div
        style={{
          width: "250px",
          background: "#1a1a1a",
          padding: "15px",
          borderRadius: "12px",
          height: "100%",
        }}
      >
        <h3 style={{ color: "#8b5cf6" }}>Online Users</h3>
        <ul style={{ listStyle: "none", padding: 0 }}>
          {onlineUsers
            .filter((u) => u.status === "online")
            .map((user) => (
              <li
                key={user.user_id}
                style={{
                  color: "#fff",
                  marginBottom: "10px",
                  background: "#272727",
                  padding: "8px 10px",
                  borderRadius: "8px",
                }}
              >
                🟢 {user.email}
              </li>
            ))}
        </ul>
      </div>

      {/* 💬 Chat Section */}
      <div style={{ flex: 1 }}>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <h2 style={{ color: "#8b5cf6" }}>FlowChat</h2>
          <button
            onClick={() => supabase.auth.signOut()}
            style={{
              background: "#8b5cf6",
              color: "white",
              border: "none",
              padding: "6px 16px",
              borderRadius: "8px",
              cursor: "pointer",
              fontWeight: "600",
            }}
          >
            Logout
          </button>
        </div>

        <div className="chat-box">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`message ${
                msg.user_email === session.user.email ? "own" : ""
              }`}
            >
              <div className="message-header">{msg.user_email}</div>
              <div>{msg.content}</div>
              <div className="message-time">
                {new Date(msg.created_at).toLocaleString()}
              </div>
            </div>
          ))}
        </div>

        <form onSubmit={sendMessage} className="input-form">
          <input
            type="text"
            className="input-box"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message..."
          />
          <button className="send-btn" type="submit">
            Send
          </button>
        </form>
      </div>
    </div>
  );
}

export default ChatRoom;
