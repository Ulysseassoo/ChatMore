import React from "react"
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
			<Link href={href}>{linkTo}</Link>
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
const Link = styled.a`
	color: ${({ theme }) => theme.accentColor};
	text-decoration: none;
`

export default LinkToForm
