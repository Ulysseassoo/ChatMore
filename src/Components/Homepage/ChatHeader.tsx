import React from "react"
import styled, { css } from "styled-components"
import Picture from "../../assets/profile.jpg"
import { Search, ThreeDotsVertical } from "styled-icons/bootstrap"
import { Cross } from "@styled-icons/entypo/Cross"

type Props = {
	avatar_url?: string
	username: string
	profile?: boolean
}

type ContainerProps = {
	$profile?: boolean
}

const ChatHeader = ({ avatar_url, username, profile }: Props) => {
	if (profile) {
		return (
			<Container $profile={profile}>
				<Label htmlFor="profile" $profile={profile}>
					<Cross />
				</Label>
				<Flex>
					<Username $profile={profile}>Profile Informations</Username>
				</Flex>
			</Container>
		)
	}
	return (
		<Container>
			<Label htmlFor="profile">
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
			</Label>
		</Container>
	)
}
const Container = styled.div<ContainerProps>`
	width: 100%;
	padding: 1rem;
	display: flex;
	align-items: center;
	justify-content: space-between;
	height: 80px;
	background-color: ${({ theme }) => theme.headerMenuColor};
	cursor: pointer;
	${({ $profile }) =>
		$profile &&
		css`
			justify-content: initial;
			gap: 0.5rem;
			cursor: initial;
			& svg {
				width: 40px;
				height: 40px;
				color: ${({ theme }) => theme.secondaryColor};
				cursor: pointer;
			}
		`}
`
const Label = styled.label<ContainerProps>`
	display: flex;
	align-items: center;
	justify-content: space-between;
	background-color: ${({ theme }) => theme.headerMenuColor};
	width: 100%;
	cursor: pointer;
	${({ $profile }) =>
		$profile &&
		css`
			width: initial;
		`}
`
const ImageContainer = styled.div`
	height: 50px;
	width: 50px;
	& img {
		border-radius: 50%;
		height: 100%;
		width: 100%;
		object-fit: cover;
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

const Username = styled.p<ContainerProps>`
	font-size: 1.2rem;
	color: ${({ theme }) => theme.secondaryColor};
	font-weight: ${({ $profile }) => ($profile ? "initial" : 600)};
	display: contents;
`

const Flex = styled.div`
	display: flex;
	gap: 1rem;
	align-items: center;
`

export default ChatHeader
