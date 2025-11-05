// src/Status.js
import React, { useEffect, useState } from "react";
import { supabase } from "./supabaseClient";

export default function Status({ userId }) {
  const [statuses, setStatuses] = useState([]);
  const [newStatus, setNewStatus] = useState("");

  // Fetch statuses (last 24 hours only)
  const fetchStatuses = async () => {
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const { data } = await supabase
      .from("statuses")
      .select("*")
      .gt("created_at", twentyFourHoursAgo)
      .order("created_at", { ascending: false });
    setStatuses(data || []);
  };

  useEffect(() => {
    fetchStatuses();

    const subscription = supabase
      .channel("public:statuses")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "statuses" },
        () => fetchStatuses()
      )
      .subscribe();

    return () => supabase.removeChannel(subscription);
  }, []);

  const addStatus = async () => {
    if (!newStatus.trim()) return;
    await supabase.from("statuses").insert([
      { username: userId, content: newStatus.trim() }
    ]);
    setNewStatus("");
  };

  return (
    <div className="status-container">
      <h3>Status (24h)</h3>

      <div className="status-input">
        <input
          type="text"
          value={newStatus}
          placeholder="Set your status..."
          onChange={(e) => setNewStatus(e.target.value)}
        />
        <button onClick={addStatus}>Post</button>
      </div>

      <div className="status-list">
        {statuses.map((s) => (
          <div key={s.id} className="status-item">
            <strong>{s.username}:</strong> {s.content}
          </div>
        ))}
      </div>
    </div>
  );
}
