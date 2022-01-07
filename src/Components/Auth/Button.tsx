import React from "react"
import styled from "styled-components"

type Props = {
	content: string
	type?: any
}

const Button = ({ content, type }: Props) => {
	return <Container type={type}>{content}</Container>
}

const Container = styled.button`
	background-color: ${({ theme }) => theme.accentColor};
	border-radius: 1rem;
	text-align: center;
	width: 100%;
	padding: 0.8rem;
	color: ${({ theme }) => theme.white};
	text-transform: uppercase;
	border: none;
	cursor: pointer;
`

export default Button
