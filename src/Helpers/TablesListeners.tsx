import React, { useEffect } from "react"
import { useNavigate } from "react-router"
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

	useEffect(() => {
		// Listening to the database on any insert or update, to update state
		const mySubscription = supabase
			.from("message")
			.on("INSERT", (payload) => {
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
		return () => {
			mySubscription.unsubscribe()
			imagesSubscription.unsubscribe()
		}
	}, [])
	return <>{children}</>
}

export default TablesListeners
