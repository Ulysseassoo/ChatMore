import React from "react"
import { useNavigate, useParams } from "react-router"
import styled, { css } from "styled-components"
import Picture from "../../assets/profile.jpg"
import { useAppDispatch, useAppSelector } from "../../redux/hooks"
import { selectRooms, updateRoomMessage } from "../../redux/room/roomSlice"
import { selectUser } from "../../redux/user/userSlice"
import { updateRoomMessages } from "../../Services/APIs"

type User = {
	id: string
	username: string
	email: string
	avatar_url: string
	updated_at: string
	phone: string
	about: string
}

type Props = {
	username: string
	about?: string
	avatar_url: string
	room_id: number
	last_message?: string
	chat?: boolean
	setActiveModal?: React.Dispatch<React.SetStateAction<boolean>>
	created_at?: Date
}

type Message = {
	id?: number
	created_at: Date
	content: string
	room: number
	user: string
	view?: boolean
}

type ContainerProps = {
	room_id?: number
	actualRoom?: number
}

type RoomState = {
	room: number
	users: User[]
	messages: Message[]
	index?: number
}

const User = ({ username, about, avatar_url, room_id, setActiveModal, last_message, chat, created_at }: Props) => {
	const navigate = useNavigate()
	const params = useParams()
	const dispatch = useAppDispatch()

	const goToChat = () => {
		navigate(`/${room_id}`)
		setActiveModal && setActiveModal!(false)
	}
	if (chat) {
		const chatRooms = useAppSelector(selectRooms)
		const user_id = useAppSelector(selectUser).id

		const getNotViewedMessages = (user_id: string) => {
			const room = chatRooms.find((room) => room.room === room_id)
			const count = room!.messages.filter((message) => {
				if (message.user !== user_id) return message.view === false
			})
			return count.length
		}

		const messagesViewed = () => {
			const room = chatRooms.find((room) => room.room === room_id)
			const messages = JSON.parse(JSON.stringify(room!.messages))
			const newMessages: Message[] = messages.map((message: Message) => {
				message.view = true
				return message
			})
			return newMessages
		}
		const updateUserMessages = async (data: any, user_id: string) => {
			const room: RoomState = JSON.parse(JSON.stringify(chatRooms.find((room, index) => room.room === room_id)))
			const count = room!.messages.filter((message) => {
				if (message.user !== user_id) return message.view === false
			})
			if (count.length === 0) return
			try {
				const messages: Message[] = await updateRoomMessages(data)
				room!.messages = messages
				room.index = 1
				console.log(chatRooms, typeof chatRooms)
				dispatch(updateRoomMessage(room))
			} catch (error: any) {
				console.log(error)
			}
		}

		return (
			<Container
				onClick={() => {
					goToChat()
					updateUserMessages(messagesViewed(), user_id)
				}}
				room_id={room_id}
				actualRoom={parseInt(params.id!)}>
				<ImageContainer>
					<img src={avatar_url !== null ? avatar_url : Picture} alt="profile picture" />
				</ImageContainer>
				<UserInformations>
					<Flex>
						<Username>{username}</Username>
						<Sub>{last_message}</Sub>
					</Flex>
					<Flex>
						<Hour>
							{new Date(created_at!).getHours()}:{new Date(created_at!).getSeconds()}
						</Hour>
						{getNotViewedMessages(user_id) > 0 && <Notifications>{getNotViewedMessages(user_id)}</Notifications>}
					</Flex>
				</UserInformations>
			</Container>
		)
	}
	return (
		<Container onClick={() => goToChat()}>
			<ImageContainer>
				<img src={avatar_url !== null ? avatar_url : Picture} alt="profile picture" />
			</ImageContainer>
			<UserInformations>
				<Flex>
					<Username>{username}</Username>
					<Sub>{about}</Sub>
				</Flex>
			</UserInformations>
		</Container>
	)
}

const Container = styled.div<ContainerProps>`
	padding: 1rem;
	transition: 0.3 ease;
	background-color: ${({ theme }) => theme.primaryColor};
	display: flex;
	align-items: center;
	gap: 1rem;
	border-bottom: 1px solid ${({ theme }) => theme.lineBreakColor};
	cursor: pointer;
	&:hover {
		background-color: ${({ theme }) => theme.lineBreakColor};
	}
	${({ room_id, actualRoom }) =>
		room_id === actualRoom &&
		css`
			background-color: ${({ theme }) => theme.lineBreakColor};
		`}
`

const ImageContainer = styled.div`
	height: 50px;
	width: 50px;
	& img {
		border-radius: 50%;
	}
`

const UserInformations = styled.div`
	display: flex;
	justify-content: space-between;
	flex: 1;
`

const Flex = styled.div`
	display: flex;
	flex-direction: column;
	align-items: left;
	overflow: hidden;
	justify-content: space-between;
`

const Username = styled.p`
	font-size: 1.2rem;
	color: ${({ theme }) => theme.secondaryColor};
	font-weight: 600;
`

const Sub = styled.span`
	font-size: 0.8rem;
	color: ${({ theme }) => theme.textColor};
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;
	width: 300px;
`

const Hour = styled.span`
	font-size: 0.75rem;
	font-weight: 600;
	color: ${({ theme }) => theme.textColor};
`

const Notifications = styled.span`
	display: flex;
	font-size: 0.7rem;
	color: ${({ theme }) => theme.white};
	background-color: ${({ theme }) => theme.accentColor};
	border-radius: 50%;
	align-items: center;
	justify-content: center;
	height: 20px;
	width: 20px;
	font-weight: bold;
`

export default User
