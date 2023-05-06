import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "@fontsource/heebo";
import "@fontsource/convergence";
import { Analytics } from "@vercel/analytics/react";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
	<React.StrictMode>
		<App />
		<Analytics />
	</React.StrictMode>,
);
