import { createSlice, PayloadAction, PayloadActionCreator } from "@reduxjs/toolkit"
import type { RootState } from "../store"

type AddMessage = {
	room_index: number
	message: Message[]
}

type AddImage = {
	image: ImageToUse
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

type ImageToUse = {
	id?: number
	created_at: Date
	message_id: number
	message_room_id: number
	message_user_id: string
	url: string
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
	images?: ImageToUse[]
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
		createRoom: (state, action: PayloadAction<RoomState>) => {
			return { ...state, rooms: [...state.rooms, action.payload], isLoading: false }
		},
		updateRoomMessage: (state, action: PayloadAction<RoomState>) => {
			const { index } = action.payload
			const data = [...state.rooms]
			const viewedMessages = data[index!].messages.map((element) => {
				if (element.view === false) {
					element.view = true
				}
				return element
			})
			data[index!] = { ...state.rooms[index!], messages: viewedMessages }
			// Immer error, so to fix we put the void here
			return void {
				...state,
				rooms: data
			}
		},
		addMessageToRoom: (state, action: PayloadAction<AddMessage>) => {
			const { room_index, message } = action.payload
			const data = [...state.rooms]
			const room = data.findIndex((room) => room.room === room_index)
			data[room] = { ...state.rooms[room!], messages: [...message, ...state.rooms[room!].messages] }
			return {
				...state,
				rooms: data
			}
		},
		updateViewMessage: (state, action: PayloadAction<AddMessage>) => {
			const { room_index, message } = action.payload
			const data = [...state.rooms]
			const room = data.findIndex((room) => room.room === room_index)
			const messageIndex = data[room].messages.findIndex((element) => element.id === message[0].id)
			data[room].messages[messageIndex].view = true
			return void {
				...state,
				rooms: data
			}
		},
		updateImageMessage: (state, action: PayloadAction<AddImage>) => {
			const { image } = action.payload
			const data = [...state.rooms]
			const room = data.findIndex((room) => room.room === image.message_room_id)
			const messageIndex = data[room].messages.findIndex((element) => element.id === image.message_id)
			data[room].messages[messageIndex].images = []
			data[room].messages[messageIndex].images?.push(image)
			return void {
				...state,
				rooms: data
			}
		},
		deleteMessageInRoom: (state, action: PayloadAction<DeleteMessage>) => {
			const { room_index, message } = action.payload
			const data = [...state.rooms]
			const room = data.findIndex((room) => room.room === room_index)
			const filteredMessages = data[room!].messages.filter((element) => element.id !== message.id)
			data[room!] = { ...state.rooms[room!], messages: filteredMessages }
			return {
				...state,
				rooms: data
			}
		},
		Loading: (state) => {
			return { ...state, isLoading: true }
		},
		EmptyRooms: () => {
			return initialState
		}
	}
})

export const {
	fetchUserRooms,
	Loading,
	updateRoomMessage,
	addMessageToRoom,
	deleteMessageInRoom,
	updateViewMessage,
	updateImageMessage,
	EmptyRooms,
	createRoom
} = roomSlice.actions

export const selectRooms = (state: RootState) => state.chatrooms.rooms
export const selectIsLoading = (state: RootState) => state.chatrooms.isLoading

export default roomSlice.reducer
