import React from "react"
import styled from "styled-components"
import { useAppSelector } from "../../redux/hooks"
import { selectUser } from "../../redux/user/userSlice"

type Props = {
	id?: number
	created_at: Date
	content: string
	room: number
	user: string
	view?: boolean
}

type ContainerProps = {
	userID: string
	messageUserID: string
	view: boolean
}

const Message = ({ content, created_at, user, view }: Props) => {
	const userID = useAppSelector(selectUser).id
	return (
		<Container userID={userID} messageUserID={user} view={view!}>
			{content}{" "}
			<Time>
				{new Date(created_at).getHours()}:{new Date(created_at).getMinutes()}
			</Time>
		</Container>
	)
}

const Container = styled.div<ContainerProps>`
	width: fit-content;
	background-color: ${({ userID, messageUserID, theme }) => (userID !== messageUserID ? theme.headerMenuColor : theme.accentColor)};
	color: ${({ theme }) => theme.white};
	box-shadow: 0 3px 6px rgba(64, 64, 64, 0.408);
	align-self: ${({ userID, messageUserID }) => (userID !== messageUserID ? "start" : "end")};
	padding: 0.25rem 1rem;
	border-radius: 10px;
	position: relative;
	cursor: pointer;
	&:hover:before {
		opacity: 100;
		bottom: -20px;
	}
	&:before {
		content: ${({ view, userID, messageUserID }) => (userID !== messageUserID ? "" : view ? "'Seen'" : "'Sent'")};
		font-size: 0.7rem;
		position: absolute;
		bottom: 0px;
		right: ${({ userID, messageUserID }) => (userID !== messageUserID ? "initial" : "10px")};
		left: ${({ userID, messageUserID }) => (userID !== messageUserID ? "10px" : "initial")};
		color: ${({ view, theme }) => (view ? theme.viewColor : theme.white)};
		transition: 0.3s ease;
		opacity: 0;
	}
`

const Time = styled.span`
	color: ${({ theme }) => theme.secondaryColor};
	font-size: 0.6rem;
	margin-left: 1.4rem;
	display: inline-block;
`

export default Message
