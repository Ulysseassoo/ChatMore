import type { RealtimeChannel } from "@supabase/supabase-js";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef } from "react";
import { create } from "zustand";
import { useShallow } from "zustand/react/shallow";
import { useRequiredUserId } from "@/features/auth/session";
import { fetchMessage } from "@/features/chat/api";
import { findMessage, messagesKey, upsertMessage } from "@/features/chat/cache";
import { blocksKey, useMyProfile } from "@/features/profile/hooks";
import { roomMembersKey, roomsKey, useRooms } from "@/features/rooms/hooks";
import type { ChatMessage } from "@/lib/types";
import { sendTyping, setOnline, subscribeToRoom, subscribeToUser, unsubscribe } from "./realtime";

const TYPING_TTL = 6_000;
const TYPING_REFRESH = 3_000;

type Store = {
	channels: Record<number, RealtimeChannel>;
	online: Record<number, string[]>;
	typing: Record<number, Record<string, number>>;
};

const useRealtimeStore = create<Store>(() => ({ channels: {}, online: {}, typing: {} }));

export function useRoomPresence(roomId: number, myId: string) {
	return useRealtimeStore(
		useShallow((s) => ({
			online: (s.online[roomId] ?? []).filter((id) => id !== myId),
			typing: Object.keys(s.typing[roomId] ?? {}).filter((id) => id !== myId),
		})),
	);
}

function setTypingState(roomId: number, userId: string, typing: boolean) {
	useRealtimeStore.setState((s) => {
		const room = { ...s.typing[roomId] };
		if (typing) room[userId] = Date.now() + TYPING_TTL;
		else delete room[userId];
		return { typing: { ...s.typing, [roomId]: room } };
	});
}

setInterval(() => {
	const now = Date.now();
	const { typing } = useRealtimeStore.getState();
	const expired = Object.values(typing).some((users) => Object.values(users).some((t) => t < now));
	if (!expired) return;
	useRealtimeStore.setState({
		typing: Object.fromEntries(
			Object.entries(typing).map(([room, users]) => [room, Object.fromEntries(Object.entries(users).filter(([, t]) => t >= now))]),
		),
	});
}, 1_000);

const lastTypingSent: Record<number, number> = {};

export function setTyping(roomId: number, myId: string, typing: boolean) {
	const channel = useRealtimeStore.getState().channels[roomId];
	if (!channel || channel.state !== "joined") return;
	const now = Date.now();
	if (typing) {
		if (now - (lastTypingSent[roomId] ?? 0) < TYPING_REFRESH) return;
		lastTypingSent[roomId] = now;
	} else {
		if (!lastTypingSent[roomId]) return;
		delete lastTypingSent[roomId];
	}
	void sendTyping(channel, myId, typing).catch(() => undefined);
}

function RoomChannel({ roomId, myId, shareOnline }: { roomId: number; myId: string; shareOnline: boolean }) {
	const qc = useQueryClient();
	const shareRef = useRef(shareOnline);
	shareRef.current = shareOnline;

	useEffect(() => {
		// Un événement n'est qu'une notification : on relit le message à travers la RLS.
		const syncMessage = async (id: number) => {
			const fresh = await fetchMessage(id).catch(() => null);
			if (!fresh) return;
			const existing = findMessage(qc, roomId, id);
			const status: ChatMessage["status"] =
				existing && existing.status !== "pending" && existing.status !== "failed"
					? existing.status
					: fresh.user_id === myId
						? "sent"
						: null;
			upsertMessage(qc, roomId, { ...fresh, status, read_count: existing?.read_count ?? 0 });
			if (fresh.user_id !== myId) setTypingState(roomId, fresh.user_id, false);
			void qc.invalidateQueries({ queryKey: roomsKey });
		};

		const channel = subscribeToRoom(roomId, myId, {
			onEvent: (event, payload) => {
				const id = Number(payload.id ?? payload.message_id);
				switch (event) {
					case "message_created":
					case "message_updated":
					case "reaction_changed":
					case "attachment_added":
						if (Number.isInteger(id)) void syncMessage(id);
						return;
					case "read":
						return void qc.invalidateQueries({ queryKey: messagesKey(roomId) });
					case "members_changed":
						void qc.invalidateQueries({ queryKey: roomMembersKey(roomId) });
						return void qc.invalidateQueries({ queryKey: roomsKey });
					case "typing":
						if (typeof payload.user_id === "string") setTypingState(roomId, payload.user_id, payload.typing === true);
				}
			},
			onPresence: (ids) => useRealtimeStore.setState((s) => ({ online: { ...s.online, [roomId]: ids } })),
			onSubscribed: () => {
				// Les diffusions ne sont pas stockées : après une coupure, on rattrape.
				void qc.invalidateQueries({ queryKey: messagesKey(roomId) });
				void qc.invalidateQueries({ queryKey: roomsKey });
				if (shareRef.current) void setOnline(channel, myId, true).catch(() => undefined);
			},
		});

		useRealtimeStore.setState((s) => ({ channels: { ...s.channels, [roomId]: channel } }));
		return () => {
			unsubscribe(channel);
			useRealtimeStore.setState((s) => {
				const { [roomId]: _c, ...channels } = s.channels;
				const { [roomId]: _o, ...online } = s.online;
				const { [roomId]: _t, ...typing } = s.typing;
				return { channels, online, typing };
			});
		};
	}, [qc, roomId, myId]);

	const previous = useRef(shareOnline);
	useEffect(() => {
		if (previous.current === shareOnline) return;
		previous.current = shareOnline;
		const channel = useRealtimeStore.getState().channels[roomId];
		if (channel?.state === "joined") void setOnline(channel, myId, shareOnline).catch(() => undefined);
	}, [roomId, myId, shareOnline]);

	return null;
}

function UserChannel({ myId }: { myId: string }) {
	const qc = useQueryClient();
	useEffect(() => {
		const channel = subscribeToUser(
			myId,
			(event) => {
				if (event === "room_joined" || event === "room_left") void qc.invalidateQueries({ queryKey: roomsKey });
				if (event === "blocks_changed") {
					void qc.invalidateQueries({ queryKey: blocksKey });
					void qc.invalidateQueries({ queryKey: roomsKey });
				}
			},
			() => void qc.invalidateQueries({ queryKey: roomsKey }),
		);
		return () => unsubscribe(channel);
	}, [qc, myId]);
	return null;
}

export function RealtimeSubscriptions() {
	const myId = useRequiredUserId();
	const { data: rooms = [] } = useRooms();
	const { data: profile } = useMyProfile();
	const visibleOnline = !!profile && profile.show_online !== "nobody";

	return (
		<>
			<UserChannel myId={myId} />
			{rooms.map((r) => (
				<RoomChannel
					key={r.room_id}
					roomId={r.room_id}
					myId={myId}
					shareOnline={visibleOnline && !r.i_blocked_peer}
				/>
			))}
		</>
	);
}
