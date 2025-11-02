// src/supabaseClient.js
import { createClient } from '@supabase/supabase-js';

// ✅ Direct Supabase credentials (since Vercel envs are sometimes async)
const supabaseUrl =
  process.env.REACT_APP_SUPABASE_URL || "https://ahjjjjnwvcvpqilgjqge.supabase.co";
const supabaseKey =
  process.env.REACT_APP_SUPABASE_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFoampqam53dmN2cHFpbGdqcWdlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEzOTg3NDAsImV4cCI6MjA3Njk3NDc0MH0.Rfo7hW6sQIrbKLl25erWBg4-mXQbWT598YZAhgmsiy4";

// 🔹 Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseKey);

// 🔹 Optional test (only runs locally)
if (process.env.NODE_ENV === "development") {
  supabase
    .from("messages")
    .select("*", { count: "exact", head: true })
    .then(({ error }) => {
      if (error) {
        console.error("❌ Supabase connection failed:", error.message);
      } else {
        console.log("✅ Connected to Supabase successfully!");
      }
    });
}
