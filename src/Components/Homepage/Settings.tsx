import React from "react"
import styled from "styled-components"
import { ArrowBack } from "@styled-icons/boxicons-regular/ArrowBack"
import { User } from "@styled-icons/feather/User"
import { Notifications } from "@styled-icons/material-outlined/Notifications"
import { DarkTheme } from "@styled-icons/fluentui-system-filled/DarkTheme"
import { UserX } from "@styled-icons/feather/UserX"
import SettingsTitle from "./SettingsTitle"
import SettingsWrapper from "./SettingsWrapper"

type Props = {
	activeSettings: boolean
	setActiveSettings: React.Dispatch<React.SetStateAction<boolean>>
}

type ContainerStyle = {
	theme?: any
	activeSettings?: boolean
}

const Settings = ({ activeSettings, setActiveSettings }: Props) => {
	const data = [
		{
			Icon: User,
			name: "Profile"
		}
		// {
		// 	Icon: Notifications,
		// 	name: "Notifications"
		// },
		// {
		// 	Icon: DarkTheme,
		// 	name: "Theme"
		// },
		// {
		// 	Icon: UserX,
		// 	name: "Bloqued Users"
		// }
	]

	return (
		<Container activeSettings={activeSettings}>
			<Wrapper>
				<Item onClick={() => setActiveSettings(false)}>
					<ArrowBack /> <Title>Settings</Title>
				</Item>
				{data.map((title, index) => {
					return (
						<Div key={index}>
							<SettingsTitle key={index} name={title.name} Icon={title.Icon} />
							<Invisible id={title.name} type="checkbox" key={`input${index}`} />
							<SettingsWrapper name={title.name} key={`wrapper${index}`} />
						</Div>
					)
				})}
			</Wrapper>
		</Container>
	)
}

const Container = styled.div<ContainerStyle>`
	background-color: ${({ theme }) => theme.primaryColor};
	width: 450px;
	border-right: 1px solid ${({ theme }) => theme.lineBreakColor};
	display: flex;
	flex-direction: column;
	position: absolute;
	z-index: 5;
	height: 100%;
	right: ${({ activeSettings }) => (activeSettings ? "0%" : "100%")};
	transition: 0.3s ease;
	top: 0;
	& input[type="checkbox"]:checked + div {
		right: 0%;
	}
	@media screen and (max-width: 910px) {
		width: 100%;
	}
`

const Wrapper = styled.div`
	position: relative;
	height: 100%;
`

const Item = styled.div`
	width: 100%;
	padding: 1rem;
	display: flex;
	align-items: center;
	height: 80px;
	background-color: #403b38;
	gap: 1rem;
	& svg {
		color: ${({ theme }) => theme.white};
		width: 30px;
		height: 30px;
		cursor: pointer;
	}
`

const Title = styled.p`
	color: ${({ theme }) => theme.white};
	font-size: 1.3rem;
	display: contents;
`
const Invisible = styled.input`
	display: none;
`

const Div = styled.div``
export default Settings
