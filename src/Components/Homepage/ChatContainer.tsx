import styled from "styled-components"
import Image from "../../assets/ChatImage.png"

const ChatContainer = () => {
	return (
		<Container>
			<ImageContainer>
				<img src={Image} alt="Image starting a chat" />
				<p>Start a conversation by clicking on any discussion !</p>
				<span>You can also invite your friends to chat with them here.</span>
			</ImageContainer>
		</Container>
	)
}

const Container = styled.div`
	flex: 1;
	background-color: ${({ theme }) => theme.headerMenuColor};
	display: flex;
	flex-direction: column;
	justify-content: center;
	align-items: center;
	gap: 1rem;
`
const ImageContainer = styled.div`
	height: 450px;
	width: 450px;
	display: flex;
	align-items: center;
	flex-direction: column;
	& p {
		font-size: 1.2rem;
		color: ${({ theme }) => theme.white};
		font-weight: 600;
	}
	& span {
		font-size: 1rem;
		color: ${({ theme }) => theme.secondaryColor};
	}
`

export default ChatContainer
