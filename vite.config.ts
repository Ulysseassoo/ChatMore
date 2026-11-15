import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
	plugins: [react()],
	resolve: {
		alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) },
	},
	build: {
		rollupOptions: {
			output: {
				// Bibliothèques mises en cache séparément du code de l'app.
				manualChunks: {
					react: ["react", "react-dom", "react-router-dom"],
					ui: ["@chakra-ui/react", "@emotion/react", "@emotion/styled", "framer-motion"],
					data: ["@supabase/supabase-js", "@tanstack/react-query", "zustand"],
				},
			},
		},
	},
});
