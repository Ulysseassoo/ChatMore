import { createClient } from "@supabase/supabase-js";
import { Database } from "../DatabaseDefinitions";

const supabaseUrl: any = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey: any = import.meta.env.VITE_SUPABASE_PUBLIC_KEY;

const supabase = createClient<Database>(supabaseUrl, supabaseKey, {
	realtime: {
		params: {
			eventsPerSecond: 20,
		},
	},
});

export { supabase };
