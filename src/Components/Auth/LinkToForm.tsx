import React from "react"
import { Link } from "react-router-dom"
import styled from "styled-components"

type Props = {
	content: string
	href: string
	linkTo: string
}

const LinkToForm = ({ content, href, linkTo }: Props) => {
	return (
		<Container>
			{content}
			<NewLink to={href}>{linkTo}</NewLink>
		</Container>
	)
}

const Container = styled.span`
	margin-top: 1.5rem;
	color: ${({ theme }) => theme.white};
	font-size: 1.2rem;
	font-weight: normal;
	display: inline-block;
`
const NewLink = styled(Link)`
	color: ${({ theme }) => theme.accentColor};
	text-decoration: none;
	transition: 0.3s ease;
	&:hover {
		color: ${({ theme }) => theme.accentColorHover};
	}
	@media (max-width: 520px) {
		font-size: 1.1rem;
	}
`

export default LinkToForm
