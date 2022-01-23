import React, { useEffect } from "react"
import styled from "styled-components"
import { Search } from "@styled-icons/boxicons-regular/Search"
import { useForm } from "react-hook-form"
import { supabase } from "../../supabaseClient"
import { useAppSelector } from "../../redux/hooks"
import { selectRooms } from "../../redux/room/roomSlice"

type RoomState = {
	room: number
	users: User[]
	messages: Message[]
	index?: number
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

const SearchBar = () => {
	const chatRooms = useAppSelector(selectRooms)
	const {
		register,
		handleSubmit,
		watch,
		formState: { errors }
	} = useForm()
	const watchText = watch("text")
	const onSubmit = (data: any) => {
		return
	}
	// const searchText = (rooms: RoomState[], value: string) => {
	// 	const results = rooms.filter((room) => room.messages.map((message) => message.content == value))
	// 	console.log(results)
	// }
	// useEffect(() => {
	// 	const subscription = watch((value, { name, type }) => {
	// 		searchText(chatRooms, value.text)
	// 	})
	// 	return () => subscription.unsubscribe()
	// }, [watch])
	return (
		<Container>
			<Form onSubmit={handleSubmit(onSubmit)}>
				<Search />
				<Input type="text" {...register("text", {})} />
			</Form>
		</Container>
	)
}

const Container = styled.div`
	height: 40px;
	background-color: ${({ theme }) => theme.primaryColor};
	border-bottom: 1px solid ${({ theme }) => theme.lineBreakColor};
`
const Form = styled.form`
	padding: 0.2rem 1rem;
	display: flex;
	width: 100%;
	height: 100%;
	align-items: center;
	gap: 0.75rem;
	& svg {
		width: 25px;
		height: 25px;
		color: ${({ theme }) => theme.textColor};
	}
`
const Input = styled.input`
	color: ${({ theme }) => theme.textColor};
	font-size: 1rem;
	width: 100%;
	background-color: transparent;
	border: none;
`
export default SearchBar
