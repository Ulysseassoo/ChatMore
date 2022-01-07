import React from "react"
import styled from "styled-components"

const AppTitle = () => {
	return (
		<Title>
			Chat<SubTitle>More</SubTitle>
		</Title>
	)
}

const Title = styled.h1`
	font-size: 4.2rem;
	color: ${({ theme }) => theme.white};
	letter-spacing: 2px;
	text-transform: uppercase;
	font-weight: bold;
	font-family: "Heebo", sans-serif;
`

const SubTitle = styled.span`
	font-weight: 300;
	font-family: "Heebo", sans-serif;
`

export default AppTitle
