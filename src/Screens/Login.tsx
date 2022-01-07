import React from "react"
import styled from "styled-components"
import AppTitle from "../Components/Auth/AppTitle"
import { Main } from "../Theme/global"
import Logo from "../assets/Logo.png"
import AuthForm from "../Components/Auth/AuthForm"
import LinkToForm from "../Components/Auth/LinkToForm"

const Login: React.FC = () => {
	return (
		<Main>
			<Container>
				<AppTitle />
				<ImageContainer>
					<img src={Logo} alt="ChatMore Logo" />
				</ImageContainer>
				<AuthForm />
				<LinkToForm content="Don't have any account ? " href="/register" linkTo="Sign Up" />
			</Container>
		</Main>
	)
}

const Container = styled.div`
	height: 100%;
	width: 450px;
	display: flex;
	align-items: center;
	flex-direction: column;
	justify-content: center;
`

const ImageContainer = styled.div`
	display: flex;
	align-items: center;
	padding: 1rem;
	background-color: ${({ theme }) => theme.headerMenuColor};
	justify-content: center;
	border-radius: 1rem;
	width: 250px;
	height: 250px;
`

export default Login
