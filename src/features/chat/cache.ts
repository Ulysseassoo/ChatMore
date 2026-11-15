import type { InfiniteData, QueryClient } from "@tanstack/react-query";
import type { ChatMessage } from "@/lib/types";
import type { MessagesPage } from "./api";

export const messagesKey = (roomId: number) => ["messages", roomId] as const;

type Data = InfiniteData<MessagesPage, unknown>;

const newerFirst = (a: ChatMessage, b: ChatMessage) =>
	b.created_at.localeCompare(a.created_at) || b.id - a.id;

const sameMessage = (a: ChatMessage, b: Partial<ChatMessage>) =>
	a.id === b.id || (!!a.client_id && a.client_id === b.client_id);

// Idempotent : un message reçu par l'insert, le temps réel ou un rechargement n'apparaît qu'une fois.
export function upsertMessage(qc: QueryClient, roomId: number, message: ChatMessage) {
	qc.setQueryData<Data>(messagesKey(roomId), (data) => {
		if (!data) return data;
		let found = false;
		const pages = data.pages.map((page) => ({
			...page,
			messages: page.messages.map((m) => {
				if (!sameMessage(m, message)) return m;
				found = true;
				return { ...m, ...message, localFile: message.attachments.length ? undefined : m.localFile };
			}),
		}));
		if (found) return { ...data, pages };
		const [first, ...rest] = pages;
		if (!first) return data;
		return { ...data, pages: [{ ...first, messages: [message, ...first.messages].sort(newerFirst) }, ...rest] };
	});
}

export function patchMessage(qc: QueryClient, roomId: number, match: Partial<ChatMessage>, patch: Partial<ChatMessage>) {
	qc.setQueryData<Data>(messagesKey(roomId), (data) =>
		data && {
			...data,
			pages: data.pages.map((page) => ({
				...page,
				messages: page.messages.map((m) => (sameMessage(m, match) ? { ...m, ...patch } : m)),
			})),
		},
	);
}

export function removeMessage(qc: QueryClient, roomId: number, match: Partial<ChatMessage>) {
	qc.setQueryData<Data>(messagesKey(roomId), (data) =>
		data && {
			...data,
			pages: data.pages.map((page) => ({ ...page, messages: page.messages.filter((m) => !sameMessage(m, match)) })),
		},
	);
}

export function findMessage(qc: QueryClient, roomId: number, id: number): ChatMessage | undefined {
	const data = qc.getQueryData<Data>(messagesKey(roomId));
	return data?.pages.flatMap((p) => p.messages).find((m) => m.id === id);
}
