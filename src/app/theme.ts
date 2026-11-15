import { extendTheme, type ThemeConfig } from "@chakra-ui/react";

/**
 * Thème « Ambre nuit » : un seul thème sombre, chaud, avec l'ambre du logo.
 * Les noms de couleurs décrivent un rôle, pas une teinte.
 */
const config: ThemeConfig = { initialColorMode: "dark", useSystemColorMode: false };

export const theme = extendTheme({
	config,
	colors: {
		cm: {
			bg: "#141211", // fond général, rail
			surface: "#1C1917", // panneaux (liste, profil)
			chat: "#191716", // fond de conversation
			raised: "#2B2826", // bulles reçues, champs
			line: "#2A2522", // séparateurs
			lineStrong: "#3A3430", // bordures de champs
			text: "#F3EFEA",
			textSoft: "#D9D2CA",
			muted: "#B8AFA6",
			subtle: "#A39A90", // horodatages (contraste ≥ 4.5:1 sur raised)
			amber: "#E6AF2E", // surfaces ambre (bulles envoyées, boutons)
			amberHover: "#F0BD45",
			amberText: "#F0C04F", // texte ambre sur fond sombre
			amberTint: "#3A2F1A", // fond d'élément actif
			amberInk: "#1B1610", // texte sur ambre
			amberInkSoft: "#5A4310", // horodatage sur ambre
			disc: "#F6E7C1", // disque derrière la mascotte
			danger: "#FF9C8A",
			dangerSolid: "#E8735A",
			dangerTint: "#3D2420",
			success: "#8FD19E",
			successDot: "#5FBF74",
		},
	},
	fonts: {
		heading: "'Heebo', system-ui, sans-serif",
		body: "'Heebo', system-ui, sans-serif",
	},
	radii: { bubble: "18px", field: "12px" },
	styles: {
		global: {
			"html, body, #root": { height: "100%" },
			body: { bg: "cm.bg", color: "cm.text", WebkitFontSmoothing: "antialiased" },
			"::selection": { bg: "cm.amber", color: "cm.amberInk" },
			"@media (prefers-reduced-motion: reduce)": {
				"*, *::before, *::after": {
					animationDuration: "0.01ms !important",
					animationIterationCount: "1 !important",
					transitionDuration: "0.01ms !important",
				},
			},
			"html[data-reduce-motion='true'] *, html[data-reduce-motion='true'] *::before, html[data-reduce-motion='true'] *::after":
				{
					animationDuration: "0.01ms !important",
					animationIterationCount: "1 !important",
					transitionDuration: "0.01ms !important",
				},
		},
	},
	components: {
		Button: {
			baseStyle: { borderRadius: "12px", fontWeight: 700 },
			sizes: { lg: { h: "52px", fontSize: "md", px: 6 }, md: { h: "44px", px: 4 } },
			variants: {
				primary: {
					bg: "cm.amber",
					color: "cm.amberInk",
					_hover: { bg: "cm.amberHover", _disabled: { bg: "cm.amber" } },
					_active: { bg: "cm.amberHover" },
				},
				secondary: {
					bg: "transparent",
					color: "cm.text",
					border: "1px solid",
					borderColor: "cm.lineStrong",
					fontWeight: 600,
					_hover: { bg: "cm.raised" },
				},
				ghost: { color: "cm.textSoft", fontWeight: 600, _hover: { bg: "cm.raised" }, _active: { bg: "cm.raised" } },
				danger: { bg: "cm.dangerSolid", color: "cm.amberInk", _hover: { bg: "#F08A73" } },
				dangerGhost: { color: "cm.danger", fontWeight: 600, _hover: { bg: "cm.dangerTint" } },
			},
			defaultProps: { variant: "secondary" },
		},
		Input: {
			variants: {
				cm: {
					field: {
						h: "50px",
						bg: "cm.bg",
						border: "1px solid",
						borderColor: "cm.lineStrong",
						borderRadius: "14px",
						_placeholder: { color: "#9A9189" },
						_hover: { borderColor: "#4A433D" },
						_focusVisible: { borderColor: "cm.amber", boxShadow: "0 0 0 1px #E6AF2E" },
						_invalid: { borderColor: "cm.dangerSolid", boxShadow: "0 0 0 1px #E8735A" },
					},
				},
			},
			defaultProps: { variant: "cm" },
		},
		Textarea: {
			variants: {
				cm: {
					bg: "cm.bg",
					border: "1px solid",
					borderColor: "cm.lineStrong",
					borderRadius: "14px",
					_placeholder: { color: "#9A9189" },
					_focusVisible: { borderColor: "cm.amber", boxShadow: "0 0 0 1px #E6AF2E" },
				},
			},
			defaultProps: { variant: "cm" },
		},
		FormLabel: { baseStyle: { fontSize: "sm", fontWeight: 500, mb: 1.5, color: "cm.text" } },
		FormError: { baseStyle: { text: { color: "cm.danger", fontSize: "sm" } } },
		Modal: {
			baseStyle: {
				overlay: { bg: "rgba(10, 8, 6, 0.66)" },
				dialog: { bg: "cm.surface", border: "1px solid", borderColor: "cm.lineStrong", borderRadius: "20px" },
			},
		},
		Menu: {
			baseStyle: {
				list: { bg: "cm.surface", borderColor: "cm.lineStrong", borderRadius: "14px", py: 1, minW: "220px" },
				item: { bg: "transparent", minH: "44px", _hover: { bg: "cm.raised" }, _focus: { bg: "cm.raised" } },
			},
		},
		Tooltip: { baseStyle: { bg: "cm.text", color: "cm.amberInk" } },
		Switch: {
			baseStyle: {
				track: { bg: "cm.lineStrong", _checked: { bg: "cm.amber" } },
				thumb: { bg: "cm.text", _checked: { bg: "cm.amberInk" } },
			},
		},
		Checkbox: {
			baseStyle: {
				control: {
					borderColor: "cm.muted",
					_checked: { bg: "cm.amber", borderColor: "cm.amber", color: "cm.amberInk", _hover: { bg: "cm.amberHover", borderColor: "cm.amberHover" } },
				},
			},
		},
	},
});
