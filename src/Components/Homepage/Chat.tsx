import React from "react"
import { useParams } from "react-router"
import styled from "styled-components"
import { useAppSelector } from "../../redux/hooks"
import { selectRooms } from "../../redux/room/roomSlice"
import Message from "./Message"

const Chat = () => {
	const { id } = useParams()
	const chatRoom = useAppSelector(selectRooms).find((room) => room.room === parseInt(id!))
	return (
		<Container>
			<ChatMessages>
				{chatRoom?.messages.map((message) => {
					return <Message {...message} images={message.images!} key={message.id} />
				})}
			</ChatMessages>
		</Container>
	)
}

const Container = styled.div`
	height: calc(100vh - 210px);
	padding: 1rem;
	width: 100%;
`

const ChatMessages = styled.div`
	overflow-y: scroll;
	scrollbar-width: thin;
	gap: 1.4rem;
	display: flex;
	flex-direction: column-reverse;
	height: 100%;
`

export default Chat
