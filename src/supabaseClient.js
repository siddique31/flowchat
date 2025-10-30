// src/supabaseClient.js
import { createClient } from '@supabase/supabase-js'

// ⚙️ Environment variables (set in Vercel → Settings → Environment Variables)
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL
const supabaseKey = process.env.REACT_APP_SUPABASE_KEY

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
