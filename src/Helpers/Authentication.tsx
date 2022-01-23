import React, { useEffect } from "react"
import { useNavigate } from "react-router"
import { useAppDispatch } from "../redux/hooks"
import { EmptyRooms, fetchUserRooms } from "../redux/room/roomSlice"
import { logout, updateProfile, updateSession } from "../redux/user/userSlice"
import { getRoom, getRoomMessages, getUserRooms } from "../Services/APIs"
import { supabase } from "../supabaseClient"

type Props = {
	children: React.ReactNode
}

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

const Authentication = ({ children }: Props) => {
	const navigate = useNavigate()
	const dispatch = useAppDispatch()

	const checkChatRooms = async (user: any) => {
		const data = await getUserRooms(user?.id!)
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
				if (room.user.id !== user.id) roomNew.users.push(room.user)
			})
			roomNew.messages = roomMessages
			newRooms.rooms.push(roomNew)
		}
		// Push them into redux
		dispatch(fetchUserRooms(newRooms))
	}

	const getUserProfile = async (user: any) => {
		try {
			let { error, data: newData }: { error: any; data: any } = await supabase.from("profiles").select("*").eq("id", user.id)
			dispatch(updateSession(user))
			dispatch(updateProfile(newData[0]))
		} catch (error) {
			console.log(error)
		}
	}

	useEffect(() => {
		const { data: listener } = supabase.auth.onAuthStateChange(async (event, session) => {
			console.log(event, session)
			switch (event) {
				case "SIGNED_IN":
					// Update the user data if user connects is active
					checkChatRooms(session?.user)
				case "SIGNED_OUT":
					dispatch(logout())
					dispatch(EmptyRooms())
					navigate("/login")
					break
				case "TOKEN_REFRESHED":
					const userSession: any = session?.user
					dispatch(updateSession(userSession))
					getUserProfile(session?.user)
				default:
					break
			}
		})
		// Check active session and set user
		const session = supabase.auth.session()
		if (!session) {
			navigate("/login")
			return
		}
		getUserProfile(session?.user)
		checkChatRooms(session?.user)

		return () => {
			listener?.unsubscribe()
		}
	}, [])
	return <>{children}</>
}

export default Authentication
