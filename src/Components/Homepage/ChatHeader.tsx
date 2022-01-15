import React from "react"
import styled, { css } from "styled-components"
import Picture from "../../assets/profile.jpg"
import { Search, ThreeDotsVertical } from "styled-icons/bootstrap"

type Props = {
	avatar_url: string
	username: string
}

const ChatHeader = ({ avatar_url, username }: Props) => {
	return (
		<Container>
			<Flex>
				<ImageContainer>
					<img src={avatar_url !== null ? avatar_url : Picture} alt="profile picture" />
				</ImageContainer>
				<Username>{username}</Username>
			</Flex>
			<IconsWrapper>
				<Search />
				<ThreeDotsVertical />
			</IconsWrapper>
		</Container>
	)
}
const Container = styled.div`
	width: 100%;
	padding: 1rem;
	display: flex;
	align-items: center;
	justify-content: space-between;
	height: 80px;
	background-color: ${({ theme }) => theme.headerMenuColor};
	cursor: pointer;
`
const ImageContainer = styled.div`
	height: 50px;
	width: 50px;
	& img {
		border-radius: 50%;
		height: 100%;
		width: 100%;
	}
`

const IconsWrapper = styled.div`
	display: flex;
	align-items: center;
	gap: 1.5rem;
	justify-content: end;
	position: relative;
	& svg {
		max-height: 100%;
		width: 30px;
		cursor: pointer;
		color: ${({ theme }) => theme.white};
		transition: 0.3s ease;
		&:hover {
			color: #e1e1e1;
		}
	}
`

const Username = styled.p`
	font-size: 1.2rem;
	color: ${({ theme }) => theme.secondaryColor};
	font-weight: 600;
`

const Flex = styled.div`
	display: flex;
	gap: 1rem;
	align-items: center;
`

export default ChatHeader
