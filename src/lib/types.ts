import type { Database } from "./database.types";

type Fn<N extends keyof Database["public"]["Functions"]> = Database["public"]["Functions"][N];
type Row<N extends keyof Database["public"]["Tables"]> = Database["public"]["Tables"][N]["Row"];

export type RoomType = Database["public"]["Enums"]["room_type"];
export type MemberRole = Database["public"]["Enums"]["member_role"];
export type OnlineVisibility = Database["public"]["Enums"]["online_visibility"];

export type Peer = { id: string; username: string; avatar_url: string | null };

export type LastMessage = {
	id: number;
	user_id: string;
	content: string;
	created_at: string;
	deleted_at: string | null;
	has_attachment: boolean;
};

export type Room = Omit<Fn<"get_my_rooms">["Returns"][number], "peer" | "last_message"> & {
	peer: Peer | null;
	last_message: LastMessage | null;
};

export type Attachment = Row<"message_attachments">;
export type Reaction = Row<"message_reactions">;

export type ChatMessage = {
	id: number;
	room_id: number;
	user_id: string;
	content: string;
	reply_to_id: number | null;
	client_id: string | null;
	edited_at: string | null;
	deleted_at: string | null;
	created_at: string;
	forwarded: boolean;
	status: "pending" | "failed" | "sent" | "read" | null;
	read_count: number | null;
	attachments: Attachment[];
	reactions: Reaction[];
	localFile?: { url: string; file: File; width?: number; height?: number };
};

export type RoomMember = Fn<"get_room_members">["Returns"][number];
export type FullProfile = Fn<"get_profile">["Returns"][number];
export type ProfileSearchResult = Fn<"search_profiles">["Returns"][number];
