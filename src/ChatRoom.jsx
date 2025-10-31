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

  // ✅ Fetch all messages from Supabase
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
    const { data } = await supabase.from("messages").select("*").order("id", { ascending: true });
    setMessages(data || []);
  };

  // ✅ Send message
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
    <div className="chat-container">
      <h2 style={{ textAlign: "center", marginBottom: "10px" }}>💬 FlowChat</h2>
      <div className="chat-box">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`message ${msg.username === userId ? "own" : ""}`}
          >
            <div className="message-header">{msg.username}</div>
            <div>{msg.content}</div>
          </div>
        ))}
      </div>

      <form onSubmit={sendMessage} className="input-form">
        <input
          type="text"
          className="input-box"
          placeholder="Type a message..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
        />
        <button type="submit" className="send-btn">Send</button>
      </form>
    </div>
  );
}

export default ChatRoom;
