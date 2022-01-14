import { configureStore } from "@reduxjs/toolkit"
import roomSlice from "./room/roomSlice"
import userSlice from "./user/userSlice"

export const store = configureStore({
	reducer: {
		auth: userSlice,
		chatrooms: roomSlice
	}
})

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
