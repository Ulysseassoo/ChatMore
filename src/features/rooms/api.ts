import { supabase } from "@/lib/supabase";
import type { LastMessage, MemberRole, Peer, Room } from "@/lib/types";

export async function fetchRooms(): Promise<Room[]> {
	const { data, error } = await supabase.rpc("get_my_rooms");
	if (error) throw error;
	return data.map((r) => ({
		...r,
		peer: r.peer as Peer | null,
		last_message: r.last_message as LastMessage | null,
	}));
}

export async function getOrCreateDirectRoom(userId: string) {
	const { data, error } = await supabase.rpc("get_or_create_direct_room", { p_other: userId });
	if (error) throw error;
	return data;
}

export async function createGroup(name: string, memberIds: string[]) {
	const { data, error } = await supabase.rpc("create_group", { p_name: name, p_member_ids: memberIds });
	if (error) throw error;
	return data;
}

export async function fetchRoomMembers(roomId: number) {
	const { data, error } = await supabase.rpc("get_room_members", { p_room_id: roomId });
	if (error) throw error;
	return data;
}

export async function addMembers(roomId: number, memberIds: string[]) {
	const { error } = await supabase.rpc("add_members", { p_room_id: roomId, p_member_ids: memberIds });
	if (error) throw error;
}

export async function removeMember(roomId: number, userId: string) {
	const { error } = await supabase.rpc("remove_member", { p_room_id: roomId, p_user_id: userId });
	if (error) throw error;
}

export async function setMemberRole(roomId: number, userId: string, role: MemberRole) {
	const { error } = await supabase.rpc("set_member_role", { p_room_id: roomId, p_user_id: userId, p_role: role });
	if (error) throw error;
}

export async function leaveRoom(roomId: number) {
	const { error } = await supabase.rpc("leave_room", { p_room_id: roomId });
	if (error) throw error;
}

export async function setRoomMuted(roomId: number, userId: string, muted: boolean) {
	const { error } = await supabase.from("room_members").update({ muted }).eq("room_id", roomId).eq("user_id", userId);
	if (error) throw error;
}

export async function renameGroup(roomId: number, name: string) {
	const { error } = await supabase.from("rooms").update({ name }).eq("id", roomId);
	if (error) throw error;
}

export async function searchProfiles(query: string) {
	const { data, error } = await supabase.rpc("search_profiles", { p_query: query, p_limit: 20 });
	if (error) throw error;
	return data;
}
