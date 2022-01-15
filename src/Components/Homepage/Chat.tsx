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
			{chatRoom?.messages.map((message) => {
				return <Message {...message} key={message.id} />
			})}
		</Container>
	)
}

const Container = styled.div`
	height: calc(100% - 210px);
	display: flex;
	flex-direction: column-reverse;
	gap: 1.2rem;
	padding: 1rem;
	width: 100%;
	overflow-y: scroll;
	scrollbar-width: thin;
`

export default Chat
