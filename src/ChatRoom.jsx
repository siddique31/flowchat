import React, { useEffect, useState } from "react";
import { supabase } from "./supabaseClient";
import { v4 as uuidv4 } from "uuid";

function ChatRoom() {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [userId, setUserId] = useState("");

  // ✅ Generate or load unique user ID once
  useEffect(() => {
    let storedId = localStorage.getItem("flowchat_user");
    if (!storedId) {
      storedId = "User-" + uuidv4().slice(0, 5);
      localStorage.setItem("flowchat_user", storedId);
    }
    setUserId(storedId);
  }, []);

  // ✅ Fetch all messages from Supabase and subscribe to new ones
  useEffect(() => {
    fetchMessages();

    const subscription = supabase
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
      supabase.removeChannel(subscription);
    };
  }, []);

  const fetchMessages = async () => {
    const { data } = await supabase
      .from("messages")
      .select("*")
      .order("id", { ascending: true });
    setMessages(data || []);
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const { error } = await supabase.from("messages").insert([
      {
        username: userId,
        content: newMessage.trim(),
      },
    ]);

    if (!error) setNewMessage("");
  };

  return (
    <div style={{ maxWidth: "600px", margin: "20px auto", fontFamily: "sans-serif" }}>
      <h2 style={{ textAlign: "center", marginBottom: "10px" }}>💬 FlowChat</h2>

      <div style={{
        border: "1px solid #ccc",
        borderRadius: "10px",
        padding: "10px",
        height: "400px",
        overflowY: "scroll",
        marginBottom: "10px",
        background: "#f9f9f9"
      }}>
        {messages.map((msg) => (
          <div
            key={msg.id}
            style={{
              marginBottom: "10px",
              textAlign: msg.username === userId ? "right" : "left",
            }}
          >
            <div style={{ fontWeight: "bold" }}>{msg.username}</div>
            <div>{msg.content}</div>
          </div>
        ))}
      </div>

      <form onSubmit={sendMessage} style={{ display: "flex", gap: "10px" }}>
        <input
          type="text"
          placeholder="Type a message..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          style={{ flex: 1, padding: "10px", borderRadius: "5px", border: "1px solid #ccc" }}
        />
        <button type="submit" style={{
          padding: "10px 20px",
          borderRadius: "5px",
          border: "none",
          background: "#0070f3",
          color: "#fff",
          cursor: "pointer"
        }}>
          Send
        </button>
      </form>
    </div>
  );
}

export default ChatRoom;
