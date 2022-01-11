import React from "react"
import styled from "styled-components"
import { StyledIcon } from "styled-icons/types"

type Props = {
	Icon: StyledIcon
	name: string
}

const SettingsTitle = ({ Icon, name }: Props) => {
	return (
		<Label htmlFor={name}>
			<Item>
				<Icon /> <Title>{name}</Title>
			</Item>
		</Label>
	)
}

const Label = styled.label``

const Item = styled.div`
	width: 100%;
	padding: 1rem;
	display: flex;
	align-items: center;
	height: 80px;
	background-color: ${({ theme }) => theme.primaryColor};
	gap: 1rem;
	transition: 0.3s ease;
	cursor: pointer;
	& svg {
		color: ${({ theme }) => theme.white};
		width: 30px;
		height: 30px;
		cursor: pointer;
	}
	border-bottom: 1px solid ${({ theme }) => theme.lineBreakColor};
	&:hover {
		background-color: ${({ theme }) => theme.lineBreakColor};
	}
`

const Title = styled.p`
	color: ${({ theme }) => theme.white};
	font-size: 1.3rem;
	display: contents;
`

export default SettingsTitle
