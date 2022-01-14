import { supabase } from "../supabaseClient"

export const getUserRooms = async (user_id: string) => {
	try {
		const { data, error }: { data: any; error: any } = await supabase.from("userHasRoom").select("*").eq("user", user_id)
		if (error) throw Error
		return data
	} catch (error) {
		return error
	}
}

export const getRoom = async (room_id: string) => {
	try {
		const { data, error } = await supabase.from("userHasRoom").select("*, user!inner(*)").eq("room", room_id)
		if (error) throw Error
		return data
	} catch (error) {
		return error
	}
}

export const getRoomMessages = async (room_id: string) => {
	try {
		const { data, error } = await supabase.from("message").select("*").eq("room", room_id).order("created_at")
		if (error) throw Error
		return data
	} catch (error) {
		return error
	}
}
