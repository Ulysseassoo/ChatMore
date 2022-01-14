import React from "react"
import styled from "styled-components"
import Picture from "../../assets/profile.jpg"

type Props = {
	username: string
	about: string
	avatar_url: string
	room_id: string
}

const User = ({ username, about, avatar_url, room_id }: Props) => {
	return (
		<Container onClick={() => console.log(room_id)}>
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

const Container = styled.div`
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
`

const Flex = styled.div`
	display: flex;
	flex-direction: column;
	align-items: left;
	overflow: hidden;
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

export default User
