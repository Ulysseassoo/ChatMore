import { REALTIME_SUBSCRIBE_STATES, type RealtimeChannel } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";

type RoomHandlers = {
	onEvent: (event: string, payload: Record<string, unknown>) => void;
	onPresence: (onlineUserIds: string[]) => void;
	onSubscribed: () => void;
};

export function subscribeToRoom(roomId: number, userId: string, handlers: RoomHandlers) {
	const channel = supabase.channel(`room:${roomId}`, {
		config: { private: true, presence: { key: userId } },
	});

	channel
		.on("broadcast", { event: "*" }, ({ event, payload }) =>
			handlers.onEvent(event, (payload ?? {}) as Record<string, unknown>),
		)
		.on("presence", { event: "sync" }, () => handlers.onPresence(Object.keys(channel.presenceState())));

	void supabase.realtime.setAuth().then(() =>
		channel.subscribe((status) => {
			if (status === REALTIME_SUBSCRIBE_STATES.SUBSCRIBED) handlers.onSubscribed();
		}),
	);

	return channel;
}

export function subscribeToUser(userId: string, onEvent: (event: string) => void, onSubscribed: () => void) {
	const channel = supabase.channel(`user:${userId}`, { config: { private: true } });
	channel.on("broadcast", { event: "*" }, ({ event }) => onEvent(event));
	void supabase.realtime.setAuth().then(() =>
		channel.subscribe((status) => {
			if (status === REALTIME_SUBSCRIBE_STATES.SUBSCRIBED) onSubscribed();
		}),
	);
	return channel;
}

// Realtime limite la présence à 5 mises à jour par 30 s : un seul envoi par conversation.
export async function setOnline(channel: RealtimeChannel, userId: string, online: boolean) {
	if (online) await channel.track({ user_id: userId });
	else await channel.untrack();
}

export async function sendTyping(channel: RealtimeChannel, userId: string, typing: boolean) {
	await channel.send({ type: "broadcast", event: "typing", payload: { user_id: userId, typing } });
}

export function unsubscribe(channel: RealtimeChannel) {
	void supabase.removeChannel(channel);
}
