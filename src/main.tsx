import "@fontsource/heebo/300.css";
import "@fontsource/heebo/400.css";
import "@fontsource/heebo/500.css";
import "@fontsource/heebo/600.css";
import "@fontsource/heebo/700.css";
import "@fontsource/heebo/800.css";
import { ChakraProvider } from "@chakra-ui/react";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import { Analytics } from "@vercel/analytics/react";
import React from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import { router } from "@/app/router";
import { theme } from "@/app/theme";
import { startAuthListener } from "@/features/auth/api";
import { applyStoredPreferences } from "@/features/settings/preferences";
import { persistOptions, queryClient } from "@/lib/queryClient";

applyStoredPreferences();
startAuthListener(queryClient);

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
	<React.StrictMode>
		<ChakraProvider theme={theme}>
			<PersistQueryClientProvider client={queryClient} persistOptions={persistOptions}>
				<RouterProvider router={router} />
			</PersistQueryClientProvider>
		</ChakraProvider>
		<Analytics />
	</React.StrictMode>,
);
