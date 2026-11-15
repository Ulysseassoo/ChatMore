import type { Room } from "@/lib/types";

/**
 * Le seul endroit qui sait si une conversation est privée ou de groupe.
 * Les composants affichent un titre, un avatar et un identifiant, sans se poser la question.
 */
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
