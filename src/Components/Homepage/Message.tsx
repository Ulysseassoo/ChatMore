import React, { useState } from "react"
import styled, { css } from "styled-components"
import { useAppSelector } from "../../redux/hooks"
import { selectUser } from "../../redux/user/userSlice"
import { ArrowIosDownward } from "@styled-icons/evaicons-solid/ArrowIosDownward"
import { DeleteBin } from "@styled-icons/remix-line/DeleteBin"
import { deleteMessage } from "../../Services/APIs"
import { toast } from "react-toastify"

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

type IconStyling = {
	theme: any
	red?: boolean
}

const Message = ({ content, created_at, user, view, id }: Props) => {
	const userID = useAppSelector(selectUser).id
	const [activeDropdown, setActiveDropdown] = useState(false)

	const deleteMessageFromID = async (id: number) => {
		try {
			const { error }: { error: any } = await deleteMessage(id)
			if (error) throw error
			setActiveDropdown(false)
		} catch (error: any) {
			// console.log(error)
			// toast.error(error.error_description || error.message)
		}
	}

	return (
		<Container userID={userID} messageUserID={user} view={view!} key={id}>
			{content}{" "}
			<Time>
				{new Date(created_at).getHours()}:{new Date(created_at).getMinutes()}
			</Time>
			{userID === user && <ArrowIosDownward onClick={() => setActiveDropdown((prev) => !prev)} />}
			{activeDropdown && (
				<Dropdown>
					<Item red onClick={() => deleteMessageFromID(id!)}>
						<DeleteBin /> Delete
					</Item>
				</Dropdown>
			)}
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
	z-index: 2;
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
	&:hover {
		& > svg {
			opacity: 100;
		}
	}
	& > svg {
		width: 22px;
		height: 22px;
		border-radius: 50%;
		position: absolute;
		top: 0;
		right: 10px;
		opacity: 0;
		transition: 0.1s ease;
		cursor: pointer;
		background-color: ${({ theme }) => theme.accentColor};
	}
`

const Time = styled.span`
	color: ${({ theme }) => theme.secondaryColor};
	font-size: 0.6rem;
	margin-left: 1.4rem;
	display: inline-block;
`

const Dropdown = styled.div`
	position: absolute;
	display: flex;
	align-items: center;
	justify-content: space-evenly;
	flex-direction: column;
	border: 1px solid ${({ theme }) => theme.textColor};
	border-radius: 5px;
	background-color: ${({ theme }) => theme.headerMenuColor};
	height: 40px;
	width: 150px;
	top: 18px;
	right: 10px;
	z-index: 10;
`

const Item = styled.div<IconStyling>`
	font-size: 0.8rem;
	display: flex;
	padding: 0.2rem 1rem;
	align-items: center;
	gap: 0.5rem;
	width: 100%;
	color: ${({ red, theme }) => (red ? theme.importantColor : theme.white)};
	transition: 0.3s ease-in;
	cursor: pointer;
	& svg {
		height: 100%;
		width: 20px;
	}
	${({ red }) =>
		red &&
		css`
			& svg {
				color: ${({ theme }) => theme.importantColor};
			}
		`}
	&:hover {
		background-color: ${({ theme }) => theme.lineBreakColor};
	}
`

export default Message
