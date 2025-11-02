// src/supabaseClient.js
import { createClient } from "@supabase/supabase-js";

// ✅ Environment variables (set in .env or Vercel dashboard)
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseKey = process.env.REACT_APP_SUPABASE_KEY;

// 🔹 Initialize Supabase client
export const supabase = createClient(supabaseUrl, supabaseKey);

// ✅ Optional connection test (dev only)
if (process.env.NODE_ENV === "development") {
  supabase
    .from("messages")
    .select("*", { count: "exact", head: true })
    .then(({ error }) => {
      if (error) console.error("❌ Supabase connection failed:", error.message);
      else console.log("✅ Supabase connected successfully!");
    });
}
