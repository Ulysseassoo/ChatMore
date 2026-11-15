import { supabase } from "@/lib/supabase";
import { resizeImage } from "@/lib/image";
import type { Attachment, ChatMessage, Reaction } from "@/lib/types";

export const PAGE_SIZE = 40;

// Jamais is_blocked : la colonne est illisible pour les utilisateurs.
const MESSAGE_COLUMNS = "id, room_id, user_id, content, reply_to_id, client_id, edited_at, deleted_at, created_at";

export type MessagesCursor = { createdAt: string; id: number } | null;
export type MessagesPage = { messages: ChatMessage[]; nextCursor: MessagesCursor };

async function fetchChildren(ids: number[]) {
	if (ids.length === 0) return { attachments: [] as Attachment[], reactions: [] as Reaction[] };
	const [attachments, reactions] = await Promise.all([
		supabase.from("message_attachments").select("*").in("message_id", ids),
		supabase.from("message_reactions").select("*").in("message_id", ids),
	]);
	if (attachments.error) throw attachments.error;
	if (reactions.error) throw reactions.error;
	return { attachments: attachments.data, reactions: reactions.data };
}

export async function fetchMessagesPage(roomId: number, cursor: MessagesCursor): Promise<MessagesPage> {
	const { data, error } = await supabase.rpc("get_messages", {
		p_room_id: roomId,
		p_before_created_at: cursor?.createdAt,
		p_before_id: cursor?.id,
		p_limit: PAGE_SIZE,
	});
	if (error) throw error;

	const { attachments, reactions } = await fetchChildren(data.map((m) => m.id));
	const messages: ChatMessage[] = data.map((m) => ({
		...m,
		status: (m.status as ChatMessage["status"]) ?? null,
		attachments: attachments.filter((a) => a.message_id === m.id),
		reactions: reactions.filter((r) => r.message_id === m.id),
	}));
	const last = data.at(-1);
	return {
		messages,
		nextCursor: data.length === PAGE_SIZE && last ? { createdAt: last.created_at, id: last.id } : null,
	};
}

export async function fetchMessage(id: number) {
	const { data, error } = await supabase.from("messages").select(MESSAGE_COLUMNS).eq("id", id).maybeSingle();
	if (error) throw error;
	if (!data) return null;
	const { attachments, reactions } = await fetchChildren([id]);
	return { ...data, attachments, reactions };
}

export async function sendMessage(input: { roomId: number; content: string; clientId: string; replyToId: number | null }) {
	const { data, error } = await supabase
		.from("messages")
		.insert({ room_id: input.roomId, content: input.content, client_id: input.clientId, reply_to_id: input.replyToId })
		.select(MESSAGE_COLUMNS)
		.single();
	if (error) throw error;
	return data;
}

export async function sendImage(input: { roomId: number; file: File; clientId: string; caption: string }) {
	const { blob, width, height } = await resizeImage(input.file);
	const path = `${input.roomId}/${crypto.randomUUID()}.webp`;
	const upload = await supabase.storage.from("attachments").upload(path, blob, { contentType: "image/webp" });
	if (upload.error) throw upload.error;

	const { data, error } = await supabase.rpc("send_attachment", {
		p_room_id: input.roomId,
		p_storage_path: path,
		p_kind: "image",
		p_mime_type: "image/webp",
		p_size_bytes: blob.size,
		p_content: input.caption,
		p_client_id: input.clientId,
		p_width: width,
		p_height: height,
	});
	if (error) {
		await supabase.storage.from("attachments").remove([path]);
		throw error;
	}
	return data;
}

export async function signedUrls(paths: string[]) {
	const { data, error } = await supabase.storage.from("attachments").createSignedUrls(paths, 3600);
	if (error) throw error;
	return data;
}

export async function markRoomRead(roomId: number) {
	const { error } = await supabase.rpc("mark_room_read", { p_room_id: roomId });
	if (error) throw error;
}

export async function editMessage(id: number, content: string) {
	const { error } = await supabase.rpc("edit_message", { p_message_id: id, p_content: content });
	if (error) throw error;
}

export async function deleteMessage(id: number, forEveryone: boolean) {
	const { error } = await supabase.rpc("delete_message", { p_message_id: id, p_for_everyone: forEveryone });
	if (error) throw error;
}

export async function setReaction(messageId: number, userId: string, emoji: string | null, hadReaction: boolean) {
	const table = supabase.from("message_reactions");
	const { error } =
		emoji === null
			? await table.delete().eq("message_id", messageId).eq("user_id", userId)
			: hadReaction
				? await table.update({ emoji }).eq("message_id", messageId).eq("user_id", userId)
				: await table.insert({ message_id: messageId, emoji });
	if (error) throw error;
}
