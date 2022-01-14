import { createSlice, PayloadAction } from "@reduxjs/toolkit"
import type { RootState } from "../store"

type RoomState = {
	room: string
	users: {}[]
	messages: []
}
type State = {
	rooms: RoomState[]
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

export default roomSlice.reducer
