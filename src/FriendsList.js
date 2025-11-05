// src/FriendsList.js
import React from "react";

const friends = [
  { id: 1, name: "Ali", online: true },
  { id: 2, name: "Ayesha", online: false },
  { id: 3, name: "Zain", online: true },
];

export default function FriendsList() {
  return (
    <div className="page-container">
      <h2>Friends</h2>
      <ul className="friends-list">
        {friends.map((f) => (
          <li key={f.id} className={f.online ? "online" : "offline"}>
            {f.name} {f.online && "🟢"}
          </li>
        ))}
      </ul>
    </div>
  );
}
