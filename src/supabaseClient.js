import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL
const supabaseKey = process.env.REACT_APP_SUPABASE_KEY

export const supabase = createClient(supabaseUrl, supabaseKey)

// Optional: only for dev testing
if (process.env.NODE_ENV === 'development') {
  supabase
    .from('messages')
    .select('*', { count: 'exact', head: true })
    .then(({ error }) => {
      if (error) console.error('❌ Supabase connection failed:', error.message)
      else console.log('✅ Connected to Supabase successfully!')
    })
}
