import { createSyncStoragePersister } from "@tanstack/query-sync-storage-persister";
import { QueryClient } from "@tanstack/react-query";
import type { PersistQueryClientOptions } from "@tanstack/react-query-persist-client";

export const queryClient = new QueryClient({
	defaultOptions: {
		queries: {
			staleTime: 30_000,
			gcTime: 24 * 60 * 60_000,
			retry: 2,
			refetchOnWindowFocus: true,
		},
	},
});

const PERSISTED = new Set(["rooms", "messages", "room-members", "profile", "blocks"]);

const safeStorage = {
	getItem: (key: string) => {
		try {
			return window.localStorage.getItem(key);
		} catch {
			return null;
		}
	},
	setItem: (key: string, value: string) => {
		try {
			window.localStorage.setItem(key, value);
		} catch {
			return;
		}
	},
	removeItem: (key: string) => {
		try {
			window.localStorage.removeItem(key);
		} catch {
			return;
		}
	},
};

type Persisted = { clientState: { queries: { queryKey: unknown[]; state: { data: unknown } }[] } };
type Pages = { pages: { messages: { id: number; localFile?: unknown }[] }[]; pageParams: unknown[] };

// On ne garde que la page la plus récente de chaque conversation, sans les fichiers locaux
// (un File ou une URL blob ne survivent pas à un rechargement).
function serialize(client: Persisted) {
	for (const query of client.clientState.queries) {
		if (query.queryKey[0] !== "messages") continue;
		const data = query.state.data as Pages | undefined;
		if (!data?.pages.length) continue;
		const first = data.pages[0]!;
		query.state.data = {
			pages: [{ ...first, messages: first.messages.filter((m) => !m.localFile) }],
			pageParams: data.pageParams.slice(0, 1),
		};
	}
	return JSON.stringify(client);
}

export const persister = createSyncStoragePersister({
	storage: safeStorage,
	key: "cm.cache",
	throttleTime: 1_000,
	serialize: serialize as (client: unknown) => string,
});

export const persistOptions: Omit<PersistQueryClientOptions, "queryClient"> = {
	persister,
	maxAge: 7 * 24 * 60 * 60_000,
	buster: "v1",
	dehydrateOptions: {
		shouldDehydrateQuery: (query) => query.state.status === "success" && PERSISTED.has(String(query.queryKey[0])),
	},
};
