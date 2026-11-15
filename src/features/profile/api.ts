import { supabase } from "@/lib/supabase";
import { resizeImage } from "@/lib/image";
import type { OnlineVisibility } from "@/lib/types";

export async function fetchProfile(userId: string) {
	const { data, error } = await supabase.rpc("get_profile", { p_user_id: userId });
	if (error) throw error;
	return data[0] ?? null;
}

export type ProfileUpdate = Partial<{
	username: string;
	about: string;
	phone: string | null;
	avatar_url: string | null;
	read_receipts: boolean;
	show_online: OnlineVisibility;
}>;

export async function updateMyProfile(userId: string, values: ProfileUpdate) {
	const { error } = await supabase.from("profiles").update(values).eq("id", userId);
	if (error) throw error;
}

/** Photo de profil : redimensionnée, déposée dans avatars/<user_id>/, URL publique. */
export async function uploadAvatar(userId: string, file: File) {
	const { blob } = await resizeImage(file, 512, 0.85);
	const path = `${userId}/${crypto.randomUUID()}.webp`;
	const { error } = await supabase.storage.from("avatars").upload(path, blob, { contentType: "image/webp" });
	if (error) throw error;
	return supabase.storage.from("avatars").getPublicUrl(path).data.publicUrl;
}

export async function fetchBlocks() {
	const { data, error } = await supabase
		.from("blocks")
		.select("blocked_id, created_at, profile:profiles!blocks_blocked_id_fkey(username, avatar_url)")
		.order("created_at", { ascending: false });
	if (error) throw error;
	return data;
}

export async function blockUser(userId: string) {
	const { error } = await supabase.from("blocks").insert({ blocked_id: userId });
	if (error) throw error;
}

export async function unblockUser(blockerId: string, userId: string) {
	const { error } = await supabase.from("blocks").delete().eq("blocker_id", blockerId).eq("blocked_id", userId);
	if (error) throw error;
}
