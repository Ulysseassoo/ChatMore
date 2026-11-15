import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
	plugins: [
		react(),
		VitePWA({
			strategies: "injectManifest",
			srcDir: "src",
			filename: "sw.ts",
			injectRegister: false,
			manifest: {
				name: "ChatMore",
				short_name: "ChatMore",
				lang: "fr",
				start_url: "/",
				display: "standalone",
				theme_color: "#141211",
				background_color: "#141211",
				icons: [
					{ src: "/icon-192.png", sizes: "192x192", type: "image/png" },
					{ src: "/icon-512.png", sizes: "512x512", type: "image/png" },
				],
			},
			injectManifest: {
				globPatterns: ["**/*.{js,css,html,png,svg,woff,woff2}"],
				maximumFileSizeToCacheInBytes: 3 * 1024 * 1024,
			},
			devOptions: { enabled: true, type: "module" },
		}),
	],
	resolve: {
		alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) },
	},
	build: {
		rollupOptions: {
			output: {
				manualChunks: {
					react: ["react", "react-dom", "react-router-dom"],
					ui: ["@chakra-ui/react", "@emotion/react", "@emotion/styled", "framer-motion"],
					data: ["@supabase/supabase-js", "@tanstack/react-query", "zustand"],
				},
			},
		},
	},
});
