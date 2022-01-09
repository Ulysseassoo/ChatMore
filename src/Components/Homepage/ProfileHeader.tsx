import { useState } from "react"
import styled, { css } from "styled-components"
import Picture from "../../assets/profile.jpg"
import { MessageSquareAdd } from "@styled-icons/boxicons-regular/MessageSquareAdd"
import { ThreeDotsVertical } from "@styled-icons/bootstrap/ThreeDotsVertical"
import { Settings2Outline } from "@styled-icons/evaicons-outline/Settings2Outline"
import { LogOut } from "@styled-icons/feather/LogOut"
import { supabase } from "../../supabaseClient"

type IconStyling = {
	theme: any
	red?: boolean
}

const ProfileHeader = () => {
	const [activeDropdown, setActiveDropdown] = useState(false)

	return (
		<Container>
			<ImageContainer>
				<img src={Picture} alt="profile picture" />
			</ImageContainer>
			<IconsWrapper>
				<MessageSquareAdd />
				<ThreeDotsVertical onClick={() => setActiveDropdown((prevState) => !prevState)} />
				{activeDropdown && (
					<Dropdown>
						<Item>
							<Settings2Outline /> Settings
						</Item>
						<Item
							red
							onClick={() => {
								supabase.auth.signOut()
								setActiveDropdown(false)
							}}>
							<LogOut /> Logout
						</Item>
					</Dropdown>
				)}
			</IconsWrapper>
		</Container>
	)
}

const Container = styled.div`
	width: 100%;
	padding: 1rem;
	display: flex;
	align-items: center;
	justify-content: space-between;
	height: 80px;
	background-color: ${({ theme }) => theme.headerMenuColor};
`
const ImageContainer = styled.div`
	height: 50px;
	width: 50px;
	& img {
		border-radius: 50%;
	}
`

const IconsWrapper = styled.div`
	display: flex;
	align-items: center;
	gap: 1.5rem;
	justify-content: end;
	position: relative;
	& svg {
		max-height: 100%;
		width: 30px;
		cursor: pointer;
		color: ${({ theme }) => theme.white};
		transition: 0.3s ease;
		&:hover {
			color: #e1e1e1;
		}
	}
`

const Dropdown = styled.div`
	position: absolute;
	display: flex;
	align-items: center;
	justify-content: space-evenly;
	flex-direction: column;
	border: 1px solid ${({ theme }) => theme.textColor};
	border-radius: 5px;
	background-color: ${({ theme }) => theme.headerMenuColor};
	height: 110px;
	width: 180px;
	top: 45px;
	right: 10px;
`

const Item = styled.div<IconStyling>`
	font-size: 0.9rem;
	display: flex;
	padding: 0.5rem 1rem;
	align-items: center;
	gap: 0.5rem;
	width: 100%;
	color: ${({ red, theme }) => (red ? theme.importantColor : theme.white)};
	transition: 0.3s ease-in;
	cursor: pointer;
	& svg {
		height: 100%;
		width: 30px;
	}
	${({ red }) =>
		red &&
		css`
			& svg {
				color: ${({ theme }) => theme.importantColor};
			}
		`}
	&:hover {
		background-color: ${({ theme }) => theme.lineBreakColor};
	}
`

export default ProfileHeader
