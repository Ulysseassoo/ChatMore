import { createSlice, PayloadAction } from "@reduxjs/toolkit"
import type { RootState } from "../store"

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
		Loading: (state) => {
			return { ...state, isLoading: true }
		}
	}
})

export const { fetchUserRooms, Loading, updateRoomMessage } = roomSlice.actions

export const selectRooms = (state: RootState) => state.chatrooms.rooms
export const selectIsLoading = (state: RootState) => state.chatrooms.isLoading

export default roomSlice.reducer
