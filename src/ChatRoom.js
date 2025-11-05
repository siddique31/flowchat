// src/ChatRoom.js
import React, { useEffect, useRef, useState } from "react";
import { supabase } from "./supabaseClient";
import { v4 as uuidv4 } from "uuid";
import Status from "./Status"; // Status component

/* Small static avatar SVG */
function AvatarIcon({ size = 36 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <rect width="24" height="24" rx="6" fill="#e6eef8" />
      <path
        d="M12 12c1.933 0 3.5-1.567 3.5-3.5S13.933 5 12 5 8.5 6.567 8.5 8.5 10.067 12 12 12zM6.5 18.5c0-2.485 2.462-4.5 5.5-4.5s5.5 2.015 5.5 4.5"
        stroke="#1a1a1a"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function ChatRoom() {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editingText, setEditingText] = useState("");
  const [userId, setUserId] = useState("");
  const [presenceCount, setPresenceCount] = useState(0);

  const messagesEndRef = useRef(null);
  const heartbeatRef = useRef(null);

  // create/load userId
  useEffect(() => {
    let stored = localStorage.getItem("flowchat_user");
    if (!stored) {
      stored = "User-" + uuidv4().slice(0, 5);
      localStorage.setItem("flowchat_user", stored);
    }
    setUserId(stored);
  }, []);

  // fetch messages + realtime subscription
  useEffect(() => {
    fetchMessages();

    const subscription = supabase
      .channel("public:messages")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages" },
        (payload) => setMessages((prev) => [...prev, payload.new])
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "messages" },
        (payload) =>
          setMessages((prev) =>
            prev.map((m) => (m.id === payload.new.id ? payload.new : m))
          )
      )
      .on(
        "postgres_changes",
        { event: "DELETE", schema: "public", table: "messages" },
        (payload) => setMessages((prev) => prev.filter((m) => m.id !== payload.old.id))
      )
      .subscribe();

    return () => supabase.removeChannel(subscription);
  }, []);

  // presence: upsert heartbeat and fetch online count every 8s
  useEffect(() => {
    if (!userId) return;

    const upsertPresence = async () => {
      await supabase
        .from("presence")
        .upsert({ username: userId, last_seen: new Date().toISOString() }, { onConflict: ["username"] });
    };

    const fetchPresenceCount = async () => {
      const thirtySecondsAgo = new Date(Date.now() - 30 * 1000).toISOString();
      const { data } = await supabase.from("presence").select("*").gt("last_seen", thirtySecondsAgo);
      setPresenceCount(data ? data.length : 0);
    };

    upsertPresence();
    fetchPresenceCount();

    heartbeatRef.current = setInterval(() => {
      upsertPresence();
      fetchPresenceCount();
    }, 8000);

    return () => {
      clearInterval(heartbeatRef.current);
      supabase.from("presence").delete().eq("username", userId);
    };
  }, [userId]);

  // auto scroll on message changes
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const fetchMessages = async () => {
    const { data } = await supabase.from("messages").select("*").order("id", { ascending: true });
    setMessages(data || []);
  };

  const sendMessage = async (e) => {
    e?.preventDefault();
    if (!newMessage.trim()) return;

    const { error } = await supabase.from("messages").insert([
      { username: userId, content: newMessage.trim(), created_at: new Date().toISOString() },
    ]);

    if (!error) setNewMessage("");
  };

  const startEdit = (msg) => {
    setEditingId(msg.id);
    setEditingText(msg.content);
  };

  const saveEdit = async (e) => {
    e.preventDefault();
    if (!editingText.trim()) return;
    await supabase.from("messages").update({ content: editingText }).eq("id", editingId);
    setEditingId(null);
    setEditingText("");
  };

  const deleteMessage = async (id) => {
    if (!window.confirm("Are you sure you want to delete this message?")) return;
    await supabase.from("messages").delete().eq("id", id);
  };

  const formatTime = (iso) => {
    if (!iso) return "";
    return new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const lastMessage = messages.length ? messages[messages.length - 1] : null;
  const isLastOwn = lastMessage && lastMessage.username === userId;
  const seenByOthers = isLastOwn && presenceCount > 1;

  return (
    <div className="chat-room">
      {/* Status Bar */}
      {userId && <Status userId={userId} />}

      {/* Chat Header */}
      <div className="chat-header">
        <h3>💬 FlowChat Pro</h3>
        <span>{presenceCount} online</span>
      </div>

      {/* Chat Messages */}
      <div className="messages">
        {messages.map((msg) => {
          const isOwn = msg.username === userId;
          return (
            <div key={msg.id} className={`message ${isOwn ? "own" : "other"}`}>
              {!isOwn && <AvatarIcon />}
              <div className="message-content">
                <strong>{msg.username}</strong>
                {editingId === msg.id ? (
                  <form onSubmit={saveEdit}>
                    <input value={editingText} onChange={(e) => setEditingText(e.target.value)} />
                    <button type="submit">Save</button>
                    <button type="button" onClick={() => { setEditingId(null); setEditingText(""); }}>Cancel</button>
                  </form>
                ) : (
                  <>
                    <p>{msg.content}</p>
                    <span>{formatTime(msg.created_at)} {isOwn && seenByOthers ? "✓ Seen" : ""}</span>
                  </>
                )}
              </div>
              {isOwn && <AvatarIcon />}
              {isOwn && !editingId && (
                <div className="msg-actions">
                  <button onClick={() => startEdit(msg)}>✏️</button>
                  <button onClick={() => deleteMessage(msg.id)}>🗑️</button>
                </div>
              )}
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Box */}
      <form onSubmit={editingId ? saveEdit : sendMessage} className="input-bar">
        <input
          type="text"
          placeholder={editingId ? "Edit message..." : "Type a message..."}
          value={editingId ? editingText : newMessage}
          onChange={(e) => editingId ? setEditingText(e.target.value) : setNewMessage(e.target.value)}
        />
        <button type="submit">{editingId ? "Update" : "Send"}</button>
      </form>
    </div>
  );
}
