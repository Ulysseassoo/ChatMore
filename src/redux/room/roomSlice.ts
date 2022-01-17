import { createSlice, PayloadAction, PayloadActionCreator } from "@reduxjs/toolkit"
import type { RootState } from "../store"

type AddMessage = {
	room_index: number
	message: Message[]
}

type DeleteMessage = {
	room_index: number
	message: Message
}
type RoomState = {
	room: number
	users: User[]
	messages: Message[]
	index?: number
}
type State = {
	rooms: RoomState[]
	isLoading?: boolean
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

type Message = {
	id?: number
	created_at: Date
	content: string
	room: number
	user: string
	view?: boolean
}

const initialState: State = {
	rooms: [],
	isLoading: true
}

export const roomSlice = createSlice({
	name: "user",
	initialState,
	reducers: {
		fetchUserRooms: (state, action: PayloadAction<State>) => {
			return { ...state, ...action.payload, isLoading: false }
		},
		updateRoomMessage: (state, action: PayloadAction<RoomState>) => {
			const { index } = action.payload
			const data = [...state.rooms]
			data[index!] = { ...state.rooms[index!], ...action.payload }
			return {
				...state,
				rooms: data
			}
		},
		addMessageToRoom: (state, action: PayloadAction<AddMessage>) => {
			const { room_index, message } = action.payload
			const data = [...state.rooms]
			data[room_index!] = { ...state.rooms[room_index!], messages: [...message, ...state.rooms[room_index!].messages] }
			return {
				...state,
				rooms: data
			}
		},
		deleteMessageInRoom: (state, action: PayloadAction<DeleteMessage>) => {
			const { room_index, message } = action.payload
			const data = [...state.rooms]
			const filteredMessages = data[room_index!].messages.filter((element) => element.id !== message.id)
			data[room_index!] = { ...state.rooms[room_index!], messages: filteredMessages }
			return {
				...state,
				rooms: data
			}
		},
		Loading: (state) => {
			return { ...state, isLoading: true }
		}
	}
})

export const { fetchUserRooms, Loading, updateRoomMessage, addMessageToRoom, deleteMessageInRoom } = roomSlice.actions

export const selectRooms = (state: RootState) => state.chatrooms.rooms
export const selectIsLoading = (state: RootState) => state.chatrooms.isLoading

export default roomSlice.reducer
