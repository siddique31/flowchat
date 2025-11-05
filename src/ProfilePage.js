// src/ProfilePage.js
import React from "react";

export default function ProfilePage() {
  return (
    <div className="page-container">
      <h2>Profile</h2>
      <div className="profile-card">
        <img
          src="/favicon.ico"
          alt="Avatar"
          className="profile-avatar"
        />
        <h3>Hafiz M. Siddique</h3>
        <p>@hafizsiddique</p>
        <p>Blue Tick Verified ✅</p>
        <p>Price: Rs 100</p>
      </div>
    </div>
  );
}
