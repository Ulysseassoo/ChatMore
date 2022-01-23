import { AnimatePresence, motion } from "framer-motion"
import { useLocation, useParams } from "react-router"
import styled, { css } from "styled-components"
import Image from "../../assets/ChatImage.png"
import { useAppSelector } from "../../redux/hooks"
import { selectIsLoading, selectRooms } from "../../redux/room/roomSlice"
import Chat from "./Chat"
import ChatHeader from "./ChatHeader"
import SendMessage from "./SendMessage"

type ContainerProps = {
	id?: string
	location?: string
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

type RoomState = {
	room: number
	users: User[]
	messages: []
}

const ChatContainer = () => {
	const params = useParams()
	const { pathname } = useLocation()
	const roomsSelector = useAppSelector(selectRooms)
	const isLoading = useAppSelector(selectIsLoading)
	const findRoom: (id: number) => RoomState = (id) => {
		const selectedRoom: any = roomsSelector.find((room) => room.room === id)
		return selectedRoom
	}

	if (params?.id && !isLoading) {
		const { id } = params
		return (
			<Container id={id} location={pathname} key={pathname}>
				<ChatHeader avatar_url={findRoom(parseInt(id)).users[0].avatar_url} username={findRoom(parseInt(id)).users[0].username} />
				<Chat />
				<SendMessage />
			</Container>
		)
	}
	return (
		<Container location={pathname}>
			<ImageContainer>
				<img src={Image} alt="Image starting a chat" />
				<p>Start a conversation by clicking on any discussion !</p>
				<span>You can also invite your friends to chat with them here.</span>
			</ImageContainer>
		</Container>
	)
}

const Container = styled.div<ContainerProps>`
	flex: 1;
	background-color: ${({ theme }) => theme.headerMenuColor};
	transition: 0.5s ease-in;
	display: flex;
	justify-content: center;
	align-items: center;
	${({ id }) =>
		id &&
		css`
			gap: 0;
			background-color: ${({ theme }) => theme.primaryColor};
			justify-content: initial;
			display: initial;
			align-items: initial;
		`}
	@media screen and (max-width: 910px) {
		position: absolute;
		height: 100%;
		width: 100%;
		left: ${({ location }) => (location === "/" ? "100%" : 0)};
		flex-direction: column;
	}
`
const ImageContainer = styled.div`
	height: 450px;
	width: 450px;
	display: flex;
	align-items: center;
	flex-direction: column;
	& p {
		font-size: 1.2rem;
		color: ${({ theme }) => theme.white};
		font-weight: 600;
	}
	& span {
		font-size: 1rem;
		color: ${({ theme }) => theme.secondaryColor};
	}
`

export default ChatContainer
