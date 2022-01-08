import React from "react"
import styled, { css } from "styled-components"

type TitleStyle = {
	header?: boolean
}

const AppTitle = ({ header }: TitleStyle) => {
	return (
		<Title header>
			Chat<SubTitle>More</SubTitle>
		</Title>
	)
}

const Title = styled.h1<TitleStyle>`
	font-size: 4.2rem;
	color: ${({ theme }) => theme.white};
	letter-spacing: 2px;
	text-transform: uppercase;
	font-weight: bold;
	font-family: "Heebo", sans-serif;
	@media (max-width: 520px) {
		font-size: 3.5rem;
	}
	${({ header }) =>
		header &&
		css`
			font-size: 2.5rem;
		`}
`

const SubTitle = styled.span`
	font-weight: 300;
	font-family: "Heebo", sans-serif;
`

export default AppTitle
