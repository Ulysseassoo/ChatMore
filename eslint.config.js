import js from "@eslint/js";
import reactHooks from "eslint-plugin-react-hooks";
import globals from "globals";
import tseslint from "typescript-eslint";

export default tseslint.config(
	{ ignores: ["dist", "src/lib/database.types.ts"] },
	{
		files: ["src/**/*.{ts,tsx}"],
		extends: [js.configs.recommended, ...tseslint.configs.recommendedTypeChecked],
		languageOptions: {
			globals: globals.browser,
			parserOptions: { projectService: true, tsconfigRootDir: import.meta.dirname },
		},
		plugins: { "react-hooks": reactHooks },
		rules: {
			...reactHooks.configs.recommended.rules,
			"@typescript-eslint/only-throw-error": "error",
			"@typescript-eslint/no-floating-promises": "error",
			"@typescript-eslint/no-misused-promises": ["error", { checksVoidReturn: { attributes: false } }],
			"@typescript-eslint/no-unused-vars": ["error", { varsIgnorePattern: "^_", argsIgnorePattern: "^_" }],
			// Seule la couche d'accès aux données parle à Supabase.
			"no-restricted-imports": [
				"error",
				{ paths: [{ name: "@/lib/supabase", message: "Passe par le fichier api.ts ou realtime.ts de la feature." }] },
			],
		},
	},
	{
		files: ["src/features/*/api.ts", "src/features/*/realtime.ts"],
		rules: { "no-restricted-imports": "off" },
	},
);
