import { useQuery } from "@tanstack/react-query";
import { fetchRoomMembers, fetchRooms } from "./api";

export const roomsKey = ["rooms"] as const;
export const roomMembersKey = (roomId: number) => ["room-members", roomId] as const;

export function useRooms() {
	return useQuery({ queryKey: roomsKey, queryFn: fetchRooms });
}

/** Une conversation de la liste (pas de requête supplémentaire). */
export function useRoom(roomId: number) {
	return useQuery({ queryKey: roomsKey, queryFn: fetchRooms, select: (rooms) => rooms.find((r) => r.room_id === roomId) });
}

export function useRoomMembers(roomId: number) {
	return useQuery({ queryKey: roomMembersKey(roomId), queryFn: () => fetchRoomMembers(roomId) });
}
