import { supabase } from "../supabaseClient"

type Message = {
	id?: number
	created_at: Date
	content: string
	room: number
	user: string
	images?: ImageToUse[]
}

type ImageToUse = {
	id?: number
	created_at: Date
	message_id: number
	message_room_id: number
	message_user_id: string
	url: string
}

export const getUserRooms = async (user_id: string) => {
	try {
		const { data, error }: { data: any; error: any } = await supabase.from("userHasRoom").select("*").eq("user", user_id)
		if (error) throw error
		return data
	} catch (error) {
		return error
	}
}

export const getRoom = async (room_id: string) => {
	try {
		const { data, error } = await supabase.from("userHasRoom").select("*, user!inner(*)").eq("room", room_id)
		if (error) throw error
		return data
	} catch (error) {
		return error
	}
}

export const getRoomMessages = async (room_id: string) => {
	try {
		const { data, error } = await supabase.from("message").select("*, images!left(*)").eq("room", room_id).order("created_at", { ascending: false })
		if (error) throw error
		return data
	} catch (error) {
		return error
	}
}

export const createMessage = async (messageData: Message): Promise<Message[]> => {
	try {
		const { data, error } = await supabase.from("message").insert(messageData)
		if (error) throw error
		return data!
	} catch (error: any) {
		return error
	}
}

export const deleteMessage = async (messageID: number) => {
	try {
		const { error } = await supabase.from("message").delete().match({ id: messageID })
		if (error) throw Error
	} catch (error) {
		return error
	}
}

export const updateRoomMessages = async (messageData: Message[]): Promise<Message[]> => {
	try {
		const { data, error } = await supabase.from("message").upsert(messageData)
		if (error) throw error
		return data!
	} catch (error: any) {
		return error
	}
}

export const createImageMessage = async (imageData: ImageToUse): Promise<ImageToUse[]> => {
	try {
		const { data, error } = await supabase.from("images").insert(imageData)
		if (error) throw error
		return data!
	} catch (error: any) {
		return error
	}
}
