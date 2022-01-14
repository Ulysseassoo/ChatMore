import { createSlice, PayloadAction } from "@reduxjs/toolkit"
import type { RootState } from "../store"

type RoomState = {
	room: string
	users: User[]
	messages: []
}
type State = {
	rooms: RoomState[]
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

const initialState: State = {
	rooms: []
}

export const roomSlice = createSlice({
	name: "user",
	initialState,
	reducers: {
		fetchUserRooms: (state, action: PayloadAction<State>) => {
			return { ...state, ...action.payload }
		}
	}
})

export const { fetchUserRooms } = roomSlice.actions

export const selectRooms = (state: RootState) => state.chatrooms.rooms

export default roomSlice.reducer
