import React, { useEffect, useState } from "react";
import { supabase } from "./supabaseClient";
import "./App.css";

function ChatRoom({ session }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");

  // 🟣 Fetch old messages
  useEffect(() => {
    fetchMessages();

    // 🟣 Subscribe to real-time new messages
    const channel = supabase
      .channel("public:messages")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages" },
        (payload) => {
          setMessages((prev) => [...prev, payload.new]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  async function fetchMessages() {
    const { data, error } = await supabase
      .from("messages")
      .select("*")
      .order("created_at", { ascending: true });

    if (!error) setMessages(data);
  }

  // 🟣 Send message
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
    <div className="chat-container">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h2 style={{ color: "#8b5cf6", fontWeight: "bold" }}>FlowChat</h2>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <span>{session.user.email}</span>
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
  );
}

export default ChatRoom;
