import React from "react"
import styled from "styled-components"
import Logo from "../assets/Logo.png"
import AppTitle from "../Auth/AppTitle"

const Header = () => {
	return (
		<Container>
			<AppTitle header />
			<ImageContainer>
				<img src={Logo} alt="ChatMore Logo" />
			</ImageContainer>
		</Container>
	)
}

const Container = styled.header`
	width: 100%;
	height: 60px;
	padding: 1rem;
	background-color: ${({ theme }) => theme.accentColor};
	color: white;
	display: flex;
	gap: 1rem;
	align-items: center;
`

const ImageContainer = styled.div`
	display: flex;
	align-items: center;
	justify-content: center;
	width: 60px;
	height: 60px;
`

export default Header
