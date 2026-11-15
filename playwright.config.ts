import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
	testDir: "./e2e",
	fullyParallel: false,
	workers: 1,
	retries: process.env.CI ? 1 : 0,
	reporter: process.env.CI ? [["github"], ["html", { open: "never" }]] : "list",
	timeout: 60_000,
	use: {
		baseURL: "http://localhost:5173",
		trace: "off",
		locale: "fr-FR",
	},
	projects: [
		{
			name: "desktop",
			use: { ...devices["Desktop Chrome"], viewport: { width: 1440, height: 900 } },
			testIgnore: /mobile/,
		},
		{ name: "mobile", use: { ...devices["Pixel 7"] }, testMatch: /mobile/ },
	],
	webServer: {
		command: "yarn vite --port 5173 --strictPort",
		url: "http://localhost:5173",
		reuseExistingServer: !process.env.CI,
	},
});
