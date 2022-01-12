import React from "react"
import styled from "styled-components"
import "react-loader-spinner/dist/loader/css/react-spinner-loader.css"
import Loader from "react-loader-spinner"

type Props = {
	content: string
	type?: any
	isSubmitting: boolean
	$settings?: boolean
}

const Button = ({ content, type, isSubmitting }: Props) => {
	if (isSubmitting) {
		return (
			<Container type={type}>
				<Loader type="TailSpin" color="#FFFFFF" height={40} width={40} />
			</Container>
		)
	}
	return <Container type={type}>{content}</Container>
}

const Container = styled.button`
	background-color: ${({ theme }) => theme.accentColor};
	border-radius: 1rem;
	width: 100%;
	padding: 0.8rem;
	color: ${({ theme }) => theme.white};
	text-transform: uppercase;
	border: none;
	cursor: pointer;
	transition: 0.2s ease-in-out;
	display: flex;
	align-items: center;
	justify-content: center;
	&:hover {
		background-color: ${({ theme }) => theme.accentColorHover};
	}
	@media (max-width: 520px) {
		font-size: 0.9rem;
	}
`

export default Button
