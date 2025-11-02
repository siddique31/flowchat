// src/ChatRoom.js
import React, { useEffect, useRef, useState } from "react";
import { supabase } from "./supabaseClient";
import { v4 as uuidv4 } from "uuid";

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
        (payload) => {
          setMessages((prev) => [...prev, payload.new]);
        }
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "messages" },
        (payload) => {
          setMessages((prev) =>
            prev.map((m) => (m.id === payload.new.id ? payload.new : m))
          );
        }
      )
      .on(
        "postgres_changes",
        { event: "DELETE", schema: "public", table: "messages" },
        (payload) => {
          setMessages((prev) => prev.filter((m) => m.id !== payload.old.id));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // presence: upsert heartbeat and fetch online count every 8s
  useEffect(() => {
    if (!userId) return;
    const upsertPresence = async () => {
      await supabase
        .from("presence")
        .upsert(
          { username: userId, last_seen: new Date().toISOString() },
          { onConflict: ["username"] }
        );
    };

    const fetchPresenceCount = async () => {
      const tenSecondsAgo = new Date(Date.now() - 30 * 1000).toISOString(); // consider active if seen within last 30s
      const { data } = await supabase
        .from("presence")
        .select("*", { count: "exact" })
        .gt("last_seen", tenSecondsAgo);
      setPresenceCount(data ? data.length : 0);
    };

    // initial upsert + fetch
    upsertPresence();
    fetchPresenceCount();

    // heartbeat interval
    heartbeatRef.current = setInterval(() => {
      upsertPresence();
      fetchPresenceCount();
    }, 8000);

    return () => {
      clearInterval(heartbeatRef.current);
      // optional: remove presence row on unmount
      supabase.from("presence").delete().eq("username", userId);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  // auto scroll on message changes
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // fetch messages
  const fetchMessages = async () => {
    const { data } = await supabase
      .from("messages")
      .select("*")
      .order("id", { ascending: true });
    setMessages(data || []);
  };

  // send new message
  const sendMessage = async (e) => {
    e?.preventDefault();
    if (!newMessage.trim()) return;

    const { error } = await supabase.from("messages").insert([
      {
        username: userId,
        content: newMessage.trim(),
        created_at: new Date().toISOString(),
      },
    ]);

    if (!error) setNewMessage("");
  };

  // start editing
  const startEdit = (msg) => {
    setEditingId(msg.id);
    setEditingText(msg.content);
  };

  // save edit
  const saveEdit = async (e) => {
    e.preventDefault();
    if (!editingText.trim()) return;
    await supabase.from("messages").update({ content: editingText }).eq("id", editingId);
    setEditingId(null);
    setEditingText("");
  };

  // delete message
  const deleteMessage = async (id) => {
    if (!window.confirm("Are you sure you want to delete this message?")) return;
    await supabase.from("messages").delete().eq("id", id);
  };

  // format time
  const formatTime = (iso) => {
    if (!iso) return "";
    const d = new Date(iso);
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  // compute simple "seen" indicator: if others present (>1) and last message is yours
  const lastMessage = messages.length ? messages[messages.length - 1] : null;
  const isLastOwn = lastMessage && lastMessage.username === userId;
  const seenByOthers = isLastOwn && presenceCount > 1;

  return (
    <div className="chat-container">
      <header className="chat-header">
        <div className="header-left">
          <span className="app-title">💬 FlowChat Pro</span>
          <span className={`online-dot ${presenceCount > 0 ? "online" : "offline"}`} />
          <span className="online-text">
            {presenceCount > 0 ? `${presenceCount} online` : "Offline"}
          </span>
        </div>
        <div className="header-right">
          <button className="call-btn" title="Audio call">📞</button>
          <button className="call-btn" title="Video call">🎥</button>
        </div>
      </header>

      <div className="chat-box">
        {messages.map((msg) => {
          const isOwn = msg.username === userId;
          return (
            <div key={msg.id} className={`chat-row ${isOwn ? "own-row" : "other-row"}`}>
              {!isOwn && (
                <div className="avatar-wrapper">
                  <AvatarIcon />
                </div>
              )}

              <div className={`message-bubble ${isOwn ? "own" : "other"}`}>
                <div className="message-row-top">
                  <div className="message-header">{msg.username}</div>
                  {isOwn && (
                    <div className="msg-actions">
                      <button className="action-btn" onClick={() => startEdit(msg)}>✏️</button>
                      <button className="action-btn" onClick={() => deleteMessage(msg.id)}>🗑️</button>
                    </div>
                  )}
                </div>

                {editingId === msg.id ? (
                  <form onSubmit={saveEdit} className="edit-form">
                    <input
                      value={editingText}
                      onChange={(e) => setEditingText(e.target.value)}
                      className="edit-input"
                    />
                    <button type="submit" className="save-btn">Save</button>
                    <button type="button" className="cancel-btn" onClick={() => { setEditingId(null); setEditingText(""); }}>Cancel</button>
                  </form>
                ) : (
                  <>
                    <div className="message-content">{msg.content}</div>
                    <div className="message-row-bottom">
                      <div className="message-time">{formatTime(msg.created_at)}</div>
                      {isOwn && <div className="seen-indicator">{seenByOthers ? "Seen ✓" : ""}</div>}
                    </div>
                  </>
                )}
              </div>

              {isOwn && (
                <div className="avatar-wrapper avatar-right">
                  <AvatarIcon />
                </div>
              )}
            </div>
          );
        })}

        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={editingId ? saveEdit : sendMessage} className="input-form">
        <input
          type="text"
          className="input-box"
          placeholder={editingId ? "Edit message..." : "Type a message..."}
          value={editingId ? editingText : newMessage}
          onChange={(e) => editingId ? setEditingText(e.target.value) : setNewMessage(e.target.value)}
        />
        <button type="submit" className="send-btn">{editingId ? "Update" : "Send"}</button>
      </form>
    </div>
  );
}
