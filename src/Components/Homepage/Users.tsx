import React, { useEffect } from "react"
import { useAppDispatch, useAppSelector } from "../../redux/hooks"
import { fetchUserRooms } from "../../redux/room/roomSlice"
import { selectUser } from "../../redux/user/userSlice"
import { getRoom, getRoomMessages, getUserRooms } from "../../Services/APIs"
import { supabase } from "../../supabaseClient"

const Users = () => {
	const userSelector = useAppSelector(selectUser)
	const dispatch = useAppDispatch()
	type RoomState = {
		room: string
		users: User[]
		messages: []
	}
	type User = {
		id: string
		username: string
		email: string
		avatar_url: string
		updated_at: string
		phone: string
		about: string
	}
	type RoomsState = {
		rooms: RoomState[]
	}

	type RoomInnerJoinData = {
		room: string
		user: User
	}

	const checkChatRooms = async () => {
		const data = await getUserRooms(userSelector.id)
		let newRooms: RoomsState = {
			rooms: []
		}
		for (let i = 0; i < data.length; i++) {
			const roomData: any = await getRoom(data[i].room)
			const roomMessages: any = await getRoomMessages(data[i].room)
			const roomNew: RoomState = {
				room: "",
				users: [],
				messages: []
			}
			roomData.forEach((room: RoomInnerJoinData) => {
				roomNew.room = room.room
				if (room.user.id !== userSelector.id) roomNew.users.push(room.user)
			})
			roomNew.messages = roomMessages
			newRooms.rooms.push(roomNew)
		}
		dispatch(fetchUserRooms(newRooms))
	}
	useEffect(() => {
		if (userSelector.id !== "") checkChatRooms()
	}, [userSelector.id])

	return <div></div>
}

export default Users
