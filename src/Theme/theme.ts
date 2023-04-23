import { extendTheme } from "@chakra-ui/react";

const GlobalTheme = extendTheme({
	colors: {
		primary: "#D4AA7D",
		textColor: "#707070",
		primaryColor: "#191716",
		secondaryColor: "#E0E2DB",
		accentColor: "#E6AF2E",
		accentColorHover: "#AA8325",
		headerMenuColor: "#2B2826",
		lineBreakColor: "#404040",
		importantColor: "#EA4848",
		profileColor: "#1F1D1B",
		viewColor: "#1492E6",
	},
	fonts: {
		body: `'Convergence', sans-serif`,
		heading: `'Heebo', sans-serif`,
	},
	styles: {
		global: () => ({
			"*": {
				margin: 0,
			},
			"html, body": {
				height: "100%",
				background: "#191716",
				color: "white",
			},
			body: {
				lineHeight: 1.5,
				WebkitFontSmoothing: "antialiased",
			},
			"*, *::before, *::after": {
				boxSizing: "border-box",
			},
			"img, picture, video, canvas, svg": {
				display: "block",
				maxWidth: "100%",
			},
			" input, button, textarea, select": {
				font: "inherit",
			},
			"p, h1, h2, h3, h4, h5, h6": {
				overflowWrap: "break-word",
			},
			"#root, #__next": {
				isolation: "isolate",
			},
		}),
	},
});

export const PADDING_DESKTOP = "6rem";

export default GlobalTheme;
