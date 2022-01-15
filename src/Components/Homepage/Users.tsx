import React, { useEffect } from "react"
import styled from "styled-components"
import { useAppDispatch, useAppSelector } from "../../redux/hooks"
import { fetchUserRooms, Loading, selectIsLoading, selectRooms } from "../../redux/room/roomSlice"
import { selectUser } from "../../redux/user/userSlice"
import { getRoom, getRoomMessages, getUserRooms } from "../../Services/APIs"
import { supabase } from "../../supabaseClient"
import User from "./User"

const Users = () => {
	const userSelector = useAppSelector(selectUser)
	const hasLoaded = useAppSelector(selectIsLoading)
	const chatRooms = useAppSelector(selectRooms)
	const dispatch = useAppDispatch()
	type RoomState = {
		room: number
		users: User[]
		messages: []
		index?: number
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
		room: number
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
				room: 0,
				users: [],
				messages: [],
				index: i
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
		if (userSelector.id !== "") {
			dispatch(Loading)
			checkChatRooms()
		}
	}, [userSelector.id])

	if (hasLoaded) {
		return <Container></Container>
	}
	return (
		<Container>
			{chatRooms.map((room) => {
				if (room.messages.length !== 0) {
					return (
						<User
							username={room.users[0].username}
							avatar_url={room.users[0].avatar_url}
							created_at={room.messages[room.messages.length - 1].created_at}
							room_id={room.room}
							key={room.room}
							last_message={room.messages[room.messages.length - 1].content}
							chat
						/>
					)
				}
			})}
		</Container>
	)
}

const Container = styled.div`
	height: 100%;
	width: 100%;
	display: flex;
	flex-direction: column;
`

export default Users
