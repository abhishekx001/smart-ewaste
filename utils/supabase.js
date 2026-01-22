
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
    console.warn("Missing request headers for supabase. Check your environment variables.");
}

// Fallback to placeholders to prevent build crash if env vars are missing
// Note: The app will not function correctly without valid credentials
const url = supabaseUrl || "https://placeholder.supabase.co";
const key = supabaseKey || "placeholder";

export const supabase = createClient(url, key)
