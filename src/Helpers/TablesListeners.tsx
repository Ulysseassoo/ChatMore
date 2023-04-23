import React, { useEffect } from "react"
import { useNavigate, useParams } from "react-router"
import { useAppDispatch, useAppSelector } from "../redux/hooks"
import {
	addMessageToRoom,
	deleteMessageInRoom,
	EmptyRooms,
	selectIsLoading,
	selectRooms,
	updateImageMessage,
	updateViewMessage
} from "../redux/room/roomSlice"
import { logout, updateProfile, updateSession } from "../redux/user/userSlice"
import { supabase } from "../supabaseClient"

type Props = {
	children: React.ReactNode
}

const TablesListeners = ({ children }: Props) => {
	const dispatch = useAppDispatch()
	const { id } = useParams()

	useEffect(() => {
		const session = supabase.auth.session()
		if (!session) return
		if (supabase) console.log("rerender")
		// Listening to the database on any insert or update, to update state
		// if (!id) return
		const mySubscription = supabase
			.from(`message`)
			.on("INSERT", (payload) => {
				console.log(payload)
				dispatch(addMessageToRoom({ message: [payload.new], room_index: parseInt(payload.new.room) }))
			})
			.on("UPDATE", (payload) => {
				dispatch(updateViewMessage({ message: [payload.new], room_index: parseInt(payload.new.room) }))
			})
			.on("DELETE", (payload) => {
				dispatch(deleteMessageInRoom({ message: payload.old, room_index: parseInt(payload.old.room) }))
			})
			.subscribe()

		const imagesSubscription = supabase
			.from("images")
			.on("INSERT", (payload) => {
				dispatch(updateImageMessage({ image: payload.new }))
			})
			.subscribe()

		const roomSubscription = supabase
			.from("room")
			.on("INSERT", async (payload) => {
				try {
					const { data, error }: { data: any; error: any } = await supabase.from("userHasRoom").select("*, user!inner(*)").eq("room", payload.new.id)
					if (error) throw error
					// Check if the user has id is in the data, if not return
					// data.map((room))
				} catch (error) {}
			})
			.subscribe()
		return () => {
			mySubscription.unsubscribe()
			imagesSubscription.unsubscribe()
			roomSubscription.unsubscribe()
		}
	}, [id])
	return <>{children}</>
}

export default TablesListeners
