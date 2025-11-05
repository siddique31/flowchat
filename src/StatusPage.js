// src/StatusPage.js
import React, { useState, useEffect } from "react";

const dummyStatus = [
  { id: 1, user: "Ali", text: "At the beach 🌊", timestamp: Date.now() },
  { id: 2, user: "Ayesha", text: "Studying 📚", timestamp: Date.now() },
];

export default function StatusPage() {
  const [statuses, setStatuses] = useState(dummyStatus);

  // auto remove after 24h
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      setStatuses((prev) =>
        prev.filter((s) => now - s.timestamp < 24 * 60 * 60 * 1000)
      );
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="page-container">
      <h2>Status</h2>
      <ul className="status-list">
        {statuses.map((s) => (
          <li key={s.id}>
            <strong>{s.user}:</strong> {s.text}
          </li>
        ))}
      </ul>
    </div>
  );
}
