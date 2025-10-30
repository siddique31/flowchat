import React, { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";

export default function ChatRoom() {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [currentUser, setCurrentUser] = useState(null);

  // ✅ Fetch current user
  useEffect(() => {
    const getUser = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (data?.user) setCurrentUser(data.user);
    };
    getUser();
  }, []);

  // ✅ Load all messages + subscribe realtime
  useEffect(() => {
    fetchMessages();

    const subscription = supabase
      .channel("realtime-messages")
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

  // ✅ Fetch messages from Supabase
  const fetchMessages = async () => {
    const { data, error } = await supabase
      .from("messages")
      .select("*")
      .order("created_at", { ascending: true });
    if (error) console.error(error);
    else setMessages(data);
  };

  // ✅ Send message with username
  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return alert("Please log in first.");

    const { error } = await supabase.from("messages").insert([
      {
        user_id: user.id,
        username: user.email, // you can change this to custom username if needed
        content: newMessage,
      },
    ]);

    if (error) console.error("Send error:", error);
    else setNewMessage("");
  };

  return (
    <div className="chat-container">
      <div className="chat-box">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`message ${
              msg.user_id === currentUser?.id ? "own" : ""
            }`}
          >
            <div className="message-header">
              <strong>{msg.username || "Anonymous"}</strong>
            </div>
            <div className="message-content">{msg.content}</div>
            <div className="message-time">
              {new Date(msg.created_at).toLocaleTimeString()}
            </div>
          </div>
        ))}
      </div>

      <form onSubmit={sendMessage} className="input-form">
        <input
          type="text"
          placeholder="Type your message..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          className="input-box"
        />
        <button type="submit" className="send-btn">Send</button>
      </form>
    </div>
  );
}
