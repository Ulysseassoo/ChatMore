import { useInfiniteQuery, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";
import type { ChatMessage } from "@/lib/types";
import { roomsKey } from "@/features/rooms/hooks";
import { fetchMessagesPage, markRoomRead, sendImage, sendMessage, signedUrls, type MessagesCursor } from "./api";
import { messagesKey, patchMessage, upsertMessage } from "./cache";

export function useMessages(roomId: number) {
	return useInfiniteQuery({
		queryKey: messagesKey(roomId),
		queryFn: ({ pageParam }) => fetchMessagesPage(roomId, pageParam),
		initialPageParam: null as MessagesCursor,
		getNextPageParam: (last) => last.nextCursor,
	});
}

const draftMessage = (roomId: number, userId: string, content: string, replyToId: number | null): ChatMessage => ({
	id: -Date.now(),
	room_id: roomId,
	user_id: userId,
	content,
	reply_to_id: replyToId,
	client_id: crypto.randomUUID(),
	edited_at: null,
	deleted_at: null,
	created_at: new Date().toISOString(),
	status: "pending",
	read_count: 0,
	attachments: [],
	reactions: [],
});

export function useSendMessage(roomId: number, userId: string) {
	const qc = useQueryClient();

	const deliver = useCallback(
		async (message: ChatMessage) => {
			const clientId = message.client_id ?? crypto.randomUUID();
			patchMessage(qc, roomId, { client_id: clientId }, { status: "pending" });
			try {
				if (message.localFile) {
					await sendImage({ roomId, file: message.localFile.file, clientId, caption: message.content });
					patchMessage(qc, roomId, { client_id: clientId }, { status: "sent" });
					void qc.invalidateQueries({ queryKey: messagesKey(roomId) });
				} else {
					const saved = await sendMessage({ roomId, content: message.content, clientId, replyToId: message.reply_to_id });
					upsertMessage(qc, roomId, { ...message, ...saved, status: "sent", read_count: 0 });
				}
				void qc.invalidateQueries({ queryKey: roomsKey });
			} catch {
				patchMessage(qc, roomId, { client_id: clientId }, { status: "failed" });
			}
		},
		[qc, roomId],
	);

	const send = useCallback(
		(content: string, replyToId: number | null, file?: { file: File; url: string; width?: number; height?: number }) => {
			const message = draftMessage(roomId, userId, content, replyToId);
			if (file) message.localFile = file;
			upsertMessage(qc, roomId, message);
			void deliver(message);
		},
		[qc, roomId, userId, deliver],
	);

	return { send, retry: deliver };
}

export function useMarkRead(roomId: number) {
	const qc = useQueryClient();
	return useCallback(async () => {
		const ok = await markRoomRead(roomId).then(
			() => true,
			() => false,
		);
		if (ok) void qc.invalidateQueries({ queryKey: roomsKey });
	}, [qc, roomId]);
}

export function useSignedUrl(path: string | undefined) {
	return useQuery({
		queryKey: ["signed-url", path],
		queryFn: async () => (await signedUrls([path!]))[0]?.signedUrl ?? null,
		enabled: !!path,
		staleTime: 50 * 60_000,
		gcTime: 55 * 60_000,
	});
}
