import React, { useEffect } from "react"
import { useNavigate } from "react-router"
import { useAppDispatch, useAppSelector } from "../redux/hooks"
import { addMessageToRoom, deleteMessageInRoom, EmptyRooms, selectRooms } from "../redux/room/roomSlice"
import { logout, updateProfile, updateSession } from "../redux/user/userSlice"
import { supabase } from "../supabaseClient"

type Props = {
	children: React.ReactNode
}

const TablesListeners = ({ children }: Props) => {
	const navigate = useNavigate()
	const dispatch = useAppDispatch()
	const chatRooms = useAppSelector(selectRooms)

	useEffect(() => {
		// Listening to the database on any insert or update, to update state
		const data = "haha"
		const mySubscription = supabase
			.from("message")
			.on("INSERT", (payload) => {
				console.log(data)
				const roomIndex = chatRooms.find((room) => room.room === parseInt(payload.new.room))?.index
				if (roomIndex === undefined) return
				dispatch(addMessageToRoom({ message: [payload.new], room_index: roomIndex! }))
			})
			.on("DELETE", (payload) => {
				const roomIndex = chatRooms.find((room) => room.room === parseInt(payload.old.room))?.index
				if (roomIndex === undefined) return
				dispatch(deleteMessageInRoom({ message: payload.old, room_index: roomIndex! }))
			})
			.subscribe()
		console.log("haha")
		return () => {
			mySubscription.unsubscribe()
		}
	}, [chatRooms])
	return <>{children}</>
}

export default TablesListeners
