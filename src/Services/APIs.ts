import { Message } from "../Interface/Types";
import { supabase } from "../supabaseClient";

type ImageToUse = {
	id?: number;
	created_at: Date;
	message_id: number;
	message_room_id: number;
	message_user_id: string;
	url: string;
};

export interface UserHasBlockedDelete {
	room_id: number | undefined;
	blocking_user_id: string | undefined;
}

interface CreateUserHasBlockedRoom {
	blocking_user_id: string;
	created_at: string;
	room_id: number;
}

export const getUserRooms = async (user_id: string) => {
	try {
		const { data, error }: { data: any; error: any } = await supabase
			.from("userHasRoom")
			.select("*")
			.eq("user", user_id);
		if (error) throw error;
		return data;
	} catch (error) {
		console.log(error);
	}
};
export const getRoom = async (room_id: string) => {
	try {
		const { data, error } = await supabase.from("userHasRoom").select("*, user!inner(*)").eq("room", room_id);
		if (error) throw error;
		return data;
	} catch (error) {
		return error;
	}
};

export const getRoomMessages = async (room_id: string) => {
	try {
		const { data, error } = await supabase
			.from("message")
			.select("*, images!left(*)")
			.eq("room", room_id)
			.eq("isBlocked", false)
			.order("created_at", { ascending: true });
		if (error) throw error;
		return data;
	} catch (error) {
		console.log(error);
	}
};

export const getRoomBlockUsers = async (room_id: string) => {
	try {
		const { data, error } = await supabase.from("userHasBlockedRoom").select("*").eq("room_id", room_id);
		if (error) throw error;
		return data;
	} catch (error) {
		console.log(error);
	}
};

export const createMessage = async (messageData: {
	created_at: string;
	room: number | undefined;
	user: string | undefined;
	content: string;
}) => {
	try {
		const { data, error } = await supabase.from("message").insert(messageData).select().single();
		if (error) throw error;
		return data;
	} catch (error: any) {
		console.log(error);
	}
};

export const deleteMessage = async (messageID: number) => {
	try {
		const { error } = await supabase.from("message").delete().match({ id: messageID });
		if (error) throw Error;
	} catch (error) {
		return error;
	}
};

export const createImageMessage = async (imageData: {
	created_at: string | null;
	url: string | null;
	message_id: number | null;
	message_room_id: number | null | undefined;
	message_user_id: string | null | undefined;
}) => {
	try {
		const { data, error } = await supabase.from("images").insert(imageData).select().single();
		if (error) throw error;
		return data;
	} catch (error: any) {
		return error;
	}
};

export const deleteImageById = async (imageId: number) => {
	try {
		const { error } = await supabase.from("images").delete().match({ id: imageId });
		if (error) throw Error;
	} catch (error) {
		console.log(error);
	}
};

export const deleteMessageById = async (messageID: number) => {
	try {
		const { error } = await supabase.from("message").delete().match({ id: messageID });
		if (error) throw Error;
	} catch (error) {
		console.log(error);
	}
};

export const updateRoomMessages = async (messageData: Message[]) => {
	try {
		const { data, error } = await supabase.from("message").upsert(messageData).select("*, images!left(*)");
		if (error) throw error;
		return data as Message[];
	} catch (error: any) {
		console.log(error);
	}
};

export const createUserBlock = async (userBlockRoom: CreateUserHasBlockedRoom) => {
	try {
		const { data, error } = await supabase.from("userHasBlockedRoom").insert(userBlockRoom).select().single();
		if (error) throw error;
		return data;
	} catch (error: any) {
		console.log(error);
	}
};

export const deleteUserBlock = async (usersDelete: UserHasBlockedDelete) => {
	try {
		const { data, error } = await supabase.from("userHasBlockedRoom").delete().match({
			blocking_user_id: usersDelete.blocking_user_id,
			room_id: usersDelete.room_id,
		});
		if (error) throw error;
		return data;
	} catch (error: any) {
		console.log(error);
	}
};
