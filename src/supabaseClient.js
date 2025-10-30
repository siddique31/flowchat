// src/supabaseClient.js
import { createClient } from '@supabase/supabase-js'

// 🔹 Your Supabase project details
const supabaseUrl = 'https://ahjjjjnwvcvpqilgjqge.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFoampqam53dmN2cHFpbGdqcWdlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEzOTg3NDAsImV4cCI6MjA3Njk3NDc0MH0.Rfo7hW6sQIrbKLl25erWBg4-mXQbWT598YZAhgmsiy4'

// 🔹 Initialize Supabase client
export const supabase = createClient(supabaseUrl, supabaseKey)

// 🔹 Optional: quick connection test
supabase
  .from('messages')
  .select('*', { count: 'exact', head: true })
  .then(({ error }) => {
    if (error) {
      console.error('❌ Supabase connection failed:', error.message)
    } else {
      console.log('✅ Connected to Supabase successfully!')
    }
  })
