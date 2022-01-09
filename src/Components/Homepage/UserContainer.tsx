import styled from "styled-components"
import ProfileHeader from "./ProfileHeader"

const UserContainer = () => {
	return (
		<Container>
			<ProfileHeader />
		</Container>
	)
}

const Container = styled.div`
	background-color: ${({ theme }) => theme.primaryColor};
	width: 450px;
	border-right: 1px solid ${({ theme }) => theme.lineBreakColor};
	display: flex;
	flex-direction: column;
`

export default UserContainer
