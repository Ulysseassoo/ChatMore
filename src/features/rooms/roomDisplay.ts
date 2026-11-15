import type { Room } from "@/lib/types";

export function getRoomDisplay(room: Room) {
	if (room.type === "direct") {
		const peer = room.peer;
		return {
			title: peer?.username ?? "Compte supprimé",
			avatarUrl: peer?.avatar_url ?? null,
			seed: peer?.id ?? String(room.room_id),
			isGroup: false,
			peerId: peer?.id ?? null,
		};
	}
	return {
		title: room.name ?? "Groupe",
		avatarUrl: room.avatar_url,
		seed: `room-${room.room_id}`,
		isGroup: true,
		peerId: null,
	};
}
