import { createClient } from "@supabase/supabase-js";
import type { Database } from "./database.types";

const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_PUBLIC_KEY;

if (!url || !key) {
	throw new Error("VITE_SUPABASE_URL et VITE_SUPABASE_PUBLIC_KEY doivent être définies (voir .env.example).");
}

export const supabase = createClient<Database>(url, key);
