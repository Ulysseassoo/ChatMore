import { createSlice, PayloadAction } from "@reduxjs/toolkit"
import type { RootState } from "../store"

// Define a type for the slice state
type userState = {
	id?: string
	username: string
	email: string
	role: string
	phone?: string
	last_sign_in_at: string
}

type authState = {
	user: userState
	loggedIn: boolean
}

const initialState: authState = {
	user: {
		id: undefined,
		username: "",
		email: "",
		role: "",
		phone: "",
		last_sign_in_at: ""
	},
	loggedIn: false
}

export const userSlice = createSlice({
	name: "user",
	initialState,
	reducers: {
		update: (state, action: PayloadAction<userState>) => {
			return { ...state, user: action.payload, loggedIn: true }
		},
		logout: (state) => {
			return { ...state, user: initialState.user, loggedIn: false }
		}
	}
})

export const { update, logout } = userSlice.actions

// Other code such as selectors can use the imported `RootState` type
export const selectUser = (state: RootState) => state.auth.user
export const selectLoggedIn = (state: RootState) => state.auth.loggedIn

export default userSlice.reducer
