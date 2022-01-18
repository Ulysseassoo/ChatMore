import React, { useState } from "react"
import { useParams } from "react-router"
import styled from "styled-components"
import { useAppSelector } from "../../redux/hooks"
import { selectIsLoading, selectRooms } from "../../redux/room/roomSlice"
import { DeleteBin } from "@styled-icons/remix-line/DeleteBin"
import Picture from "../../assets/profile.jpg"
import ChatHeader from "./ChatHeader"

type RoomState = {
	room: number
	users: User[]
	messages: []
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

const ProfilContainer = () => {
	const { id } = useParams()
	const roomsSelector = useAppSelector(selectRooms)
	const isLoading = useAppSelector(selectIsLoading)

	const findRoom: (id: number) => RoomState = (id) => {
		const selectedRoom: any = roomsSelector.find((room) => room.room === id)
		return selectedRoom
	}
	if (!isLoading && id) {
		return (
			<>
				<Checkbox id="profile" type="checkbox" />
				<Container>
					<ChatHeader username={findRoom(parseInt(id!)).users[0].username} profile={true} />
					<ImageContainer>
						<Image>
							<img
								src={findRoom(parseInt(id!)).users[0].avatar_url !== null ? findRoom(parseInt(id!)).users[0].avatar_url : Picture}
								alt="profile picture"
							/>
						</Image>
						<Text>{findRoom(parseInt(id!)).users[0].username}</Text>
					</ImageContainer>
					<Bio>
						<Text>About</Text>
						<LittleText>{findRoom(parseInt(id!)).users[0].about}</LittleText>
					</Bio>
					<Item>
						<DeleteBin />
						Delete this Discussion
					</Item>
				</Container>
			</>
		)
	}
	return <></>
}

const Container = styled.div`
	background-color: ${({ theme }) => theme.primaryColor};
	border-right: 1px solid ${({ theme }) => theme.lineBreakColor};
	display: flex;
	flex-direction: column;
	position: relative;
	border-left: 1px solid ${({ theme }) => theme.lineBreakColor};
	overflow-y: scroll;
	scrollbar-width: thin;
	width: 0px;
	transition: 0.15s ease-in;
	@media screen and (max-width: 910px) {
		position: absolute;
		height: 100%;
		width: 100%;
		left: 100%;
		z-index: 10;
	}
`

const Checkbox = styled.input`
	display: none;
	&:checked + div {
		width: 400px;
		@media screen and (max-width: 910px) {
			width: 100%;
			left: 0;
		}
	}
`

const ImageContainer = styled.div`
	height: 50%;
	background-color: ${({ theme }) => theme.profileColor};
	width: 100%;
	overflow: hidden;
	padding: 1rem;
	display: flex;
	justify-content: center;
	align-items: center;
	flex-direction: column;
	gap: 1rem;
`

const Image = styled.div`
	height: 250px;
	width: 250px;
	& img {
		border-radius: 50%;
		width: 100%;
		height: 100%;
		object-fit: cover;
		user-select: none;
	}
`

const Text = styled.p`
	display: contents;
	font-size: 1.3rem;
	color: ${({ theme }) => theme.secondaryColor};
`

const Bio = styled.div`
	display: flex;
	flex-direction: column;
	padding: 1rem;
	background-color: ${({ theme }) => theme.profileColor};
	margin-top: 1rem;
	gap: 0.5rem;
`

const LittleText = styled.p`
	font-size: 0.9rem;
	color: ${({ theme }) => theme.secondaryColor};
`

const Item = styled.div`
	display: flex;
	padding: 1rem;
	background-color: ${({ theme }) => theme.profileColor};
	margin-top: 1rem;
	gap: 0.5rem;
	color: ${({ theme }) => theme.importantColor};
	align-items: center;
	font-size: 1.1rem;
	cursor: pointer;
	transition: 0.3s ease-in-out;
	& svg {
		height: 20px;
		width: 20px;
	}
	&:hover {
		background-color: ${({ theme }) => theme.lineBreakColor};
	}
`

export default ProfilContainer
