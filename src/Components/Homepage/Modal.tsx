import React from "react"
import { useForm } from "react-hook-form"
import { toast } from "react-toastify"
import styled from "styled-components"
import { useAppDispatch, useAppSelector } from "../../redux/hooks"
import { selectUser } from "../../redux/user/userSlice"
import { supabase } from "../../supabaseClient"
import { ArrowBack } from "@styled-icons/boxicons-regular/ArrowBack"
import { motion } from "framer-motion"
import { createRoom, selectRooms } from "../../redux/room/roomSlice"
import User from "./User"
import { useNavigate } from "react-router"

type Props = {
	setActiveModal: React.Dispatch<React.SetStateAction<boolean>>
}

type FormData = {
	username: string
}

type RoomState = {
	room: number
	users: User[]
	messages: Message[]
	index?: number
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

type ImageToUse = {
	id?: number
	created_at: Date
	message_id: number
	message_room_id: number
	message_user_id: string
	url: string
}

const Modal = ({ setActiveModal }: Props) => {
	const userSelector = useAppSelector(selectUser)
	const roomsSelector = useAppSelector(selectRooms)
	const dispatch = useAppDispatch()
	const navigate = useNavigate()
	const checkIfUserHasRoom = (newUserId: string) => {
		const check = roomsSelector.filter((room) => room.users[0].id === newUserId)
		if (check.length === 0) return true
		return false
	}
	const {
		register,
		handleSubmit,
		formState: { errors, isSubmitting }
	} = useForm()
	const onSubmit = async (data: FormData) => {
		try {
			// Get ID of User to add
			const { data: userData, error }: { data: any; error: any } = await supabase.from("profiles").select("*").eq("username", data.username)
			if (error) throw Error
			const { id: userId } = userData[0]
			// We need to check if that user doesn't already have a relation with the existing user
			if (!checkIfUserHasRoom(userId)) {
				toast.error("You already have a conversation with that user !")
				return
			}
			// Create a room
			const { data: roomData, error: roomError }: { data: any; error: any } = await supabase.from("room").insert({ created_at: new Date() })
			if (roomError) throw Error
			const { id: roomId } = roomData[0]
			// Create ChatRoom between users
			const { data: chatUserRoomData, error: chatUserRoomError }: { data: any; error: any } = await supabase
				.from("userHasRoom")
				.insert({ room: roomId, user: userId })
			if (chatUserRoomError) throw Error
			const { data: userRoomData, error: userRoomError }: { data: any; error: any } = await supabase
				.from("userHasRoom")
				.insert({ room: roomId, user: userSelector.id })
			if (userRoomError) throw Error
			toast.success(`You can now chat with ${data.username}`)
			const newRoom: RoomState = {
				room: roomId,
				users: [],
				messages: []
			}
			newRoom.users.push(userData[0])
			dispatch(createRoom(newRoom))
			navigate(`/${roomId}`)
			setActiveModal(false)
		} catch (error: any) {
			toast.error(error.error_description || error.message)
		}
	}

	const variants = {
		visible: { x: 0 },
		hidden: { x: "-100%" }
	}

	return (
		<Container animate="visible" initial="hidden" transition={{ ease: "easeOut", duration: 0.3 }} variants={variants} exit="hidden">
			<Flex onClick={() => setActiveModal(false)}>
				<ArrowBack />
				New Chat
			</Flex>
			<Wrapper>
				<Form onSubmit={handleSubmit(onSubmit)}>
					<Title>Add a new User (username)</Title>
					<Input type="text" autoFocus placeholder="username" {...register("username", {})} />
				</Form>
			</Wrapper>
			<ScrollContainer>
				{roomsSelector.map((room) => {
					return (
						<User
							username={room.users[0].username}
							about={room.users[0].about}
							avatar_url={room.users[0].avatar_url}
							room_id={room.room}
							setActiveModal={setActiveModal}
							key={room.room}
						/>
					)
				})}
			</ScrollContainer>
		</Container>
	)
}

const Container = styled(motion.div)`
	position: absolute;
	inset: 0;
	height: 100%;
	width: 100%;
	z-index: 10;
	display: flex;
	border: 1px solid ${({ theme }) => theme.lineBreakColor};
	background-color: ${({ theme }) => theme.primaryColor};
	flex-direction: column;
`

const Wrapper = styled.div`
	display: flex;
	align-items: center;
	justify-content: space-evenly;
	flex-direction: column;
	width: 100%;
	border-bottom: 1px solid ${({ theme }) => theme.lineBreakColor};
	background-color: ${({ theme }) => theme.primaryColor};
	padding: 1rem;
`

const Flex = styled.div`
	display: flex;
	gap: 1rem;
	color: ${({ theme }) => theme.white};
	width: 100%;
	align-items: center;
	height: 80px;
	padding: 1rem;
	cursor: pointer;
	background-color: ${({ theme }) => theme.headerMenuColor};
	& svg {
		width: 30px;
		height: 30px;
	}
`

const Title = styled.p`
	color: ${({ theme }) => theme.white};
`

const Form = styled.form`
	display: flex;
	width: 100%;
	padding: 0.5rem;
	flex-direction: column;
	gap: 0.25rem;
`

const Input = styled.input`
	width: 100%;
	padding: 0.2rem;
	border-radius: 0.5rem;
	border: 1px solid ${({ theme }) => theme.secondaryColor};
	background-color: ${({ theme }) => theme.textColor};
	color: ${({ theme }) => theme.white};
	transition: 0.3s ease;
	&:focus {
		outline: 1px solid ${({ theme }) => theme.accentColor};
	}
`

const ScrollContainer = styled.div`
	width: 100%;
	overflow-y: scroll;
	height: 100%;
	scrollbar-width: thin;
`

export default Modal
