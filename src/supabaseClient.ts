import { createClient } from "@supabase/supabase-js"

const supabaseUrl: any = import.meta.env.VITE_SUPABASE_URL
const supabaseKey: any = import.meta.env.VITE_SUPABASE_PUBLIC_KEY

const supabase = createClient(supabaseUrl, supabaseKey)

export { supabase }
