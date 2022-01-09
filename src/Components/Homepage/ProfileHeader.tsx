import styled from "styled-components"
import Picture from "../../assets/profile.jpg"
import { MessageSquareAdd } from "@styled-icons/boxicons-regular/MessageSquareAdd"
import { ThreeDotsVertical } from "@styled-icons/bootstrap/ThreeDotsVertical"

const ProfileHeader = () => {
	return (
		<Container>
			<ImageContainer>
				<img src={Picture} alt="profile picture" />
			</ImageContainer>
			<IconsWrapper>
				<MessageSquareAdd />
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
`
const ImageContainer = styled.div`
	height: 50px;
	width: 50px;
	& img {
		border-radius: 50%;
	}
`

const IconsWrapper = styled.div`
	display: flex;
	align-items: center;
	gap: 1.5rem;
	justify-content: end;
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

export default ProfileHeader
