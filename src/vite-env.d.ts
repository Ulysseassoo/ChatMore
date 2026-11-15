/// <reference types="vite/client" />
/// <reference types="vite-plugin-pwa/client" />

interface ImportMetaEnv {
	readonly VITE_SUPABASE_URL: string;
	readonly VITE_SUPABASE_PUBLIC_KEY: string;
	readonly VITE_VAPID_PUBLIC_KEY?: string;
}

interface ImportMeta {
	readonly env: ImportMetaEnv;
}
