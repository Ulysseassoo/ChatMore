import { useIsRestoring, useQueryClient, type InfiniteData } from "@tanstack/react-query";
import { useEffect } from "react";
import type { ChatMessage } from "@/lib/types";
import type { MessagesPage } from "./api";
import { removeMessage } from "./cache";
import { deliverMessage } from "./hooks";

// Au retour du réseau (et au démarrage), on renvoie les messages restés en échec.
export function useOutbox() {
	const qc = useQueryClient();
	const restoring = useIsRestoring();

	useEffect(() => {
		const flush = () => {
			if (!navigator.onLine) return;
			const failed: ChatMessage[] = qc
				.getQueriesData<InfiniteData<MessagesPage>>({ queryKey: ["messages"] })
				.flatMap(([, data]) => data?.pages.flatMap((p) => p.messages) ?? [])
				.filter((m) => m.status === "failed" || (m.status === "pending" && m.id < 0));
			for (const message of failed) {
				if (!message.content && !message.localFile) removeMessage(qc, message.room_id, { id: message.id });
				else void deliverMessage(qc, message);
			}
		};
		if (restoring) return;
		flush();
		window.addEventListener("online", flush);
		return () => window.removeEventListener("online", flush);
	}, [qc, restoring]);
}
