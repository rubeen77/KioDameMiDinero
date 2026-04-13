import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://dohbiguvawyccprljxws.supabase.co'
const SUPABASE_KEY = 'sb_publishable_TXztTeeOy5O0-o47-XcLtA_JuEEO7DY'

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    storageKey: 'kio_auth',
    storage: localStorage,
  }
})
