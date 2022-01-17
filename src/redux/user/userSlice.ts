import { createSlice, PayloadAction } from "@reduxjs/toolkit"
import type { RootState } from "../store"
import _ from "underscore"

// Define a type for the slice state
type sessionState = {
	id?: string
	aud: string
	username: string
	email: string
	role: string
	last_sign_in_at: string
	email_confirmed_at: string
	phone: string
	confirmed_at: string
	user_metadata: object
	app_metadata: object
	created_at: string
	updated_at: string
	identities: []
}

type userState = {
	id: string
	updated_at: string
	username: string
	avatar_url: string
	email: string
	phone: string
	about: string
}

type userProfile = {
	username: string
	phone: string
	about: string
}

type authState = {
	session: sessionState
	loggedIn: boolean
	user: userState
}

const initialState: authState = {
	user: {
		id: "",
		username: "",
		email: "",
		avatar_url: "",
		updated_at: "",
		phone: "",
		about: ""
	},
	session: {
		id: undefined,
		aud: "",
		username: "",
		email: "",
		role: "",
		phone: "",
		last_sign_in_at: "",
		email_confirmed_at: "",
		confirmed_at: "",
		user_metadata: {},
		app_metadata: {},
		created_at: "",
		updated_at: "",
		identities: []
	},
	loggedIn: false
}

export const userSlice = createSlice({
	name: "user",
	initialState,
	reducers: {
		updateSession: (state, action: PayloadAction<sessionState>) => {
			return { ...state, session: { ...state.session, ...action.payload }, loggedIn: true }
		},
		updateProfile: (state, action: PayloadAction<userState>) => {
			return { ...state, user: { ...state.user, ...action.payload } }
		},
		updateProfileData: (state, action: PayloadAction<userProfile>) => {
			return { ...state, user: { ...state.user, ...action.payload } }
		},
		logout: (state) => {
			return { ...state, user: initialState.user, session: initialState.session, loggedIn: false }
		}
	}
})

export const { updateSession, updateProfile, logout, updateProfileData } = userSlice.actions

// Other code such as selectors can use the imported `RootState` type
export const selectUser = (state: RootState) => state.auth.user
export const userIsEqual = (state: RootState) => (state.auth.user, _.isEqual)
export const selectSession = (state: RootState) => state.auth.session
export const selectLoggedIn = (state: RootState) => state.auth.loggedIn

export default userSlice.reducer
