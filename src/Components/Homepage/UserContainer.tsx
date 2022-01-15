import { useEffect, useState } from "react"
import styled from "styled-components"
import { useAppDispatch, useAppSelector } from "../../redux/hooks"
import { addMessageToRoom, selectRooms } from "../../redux/room/roomSlice"
import { supabase } from "../../supabaseClient"
import ProfileHeader from "./ProfileHeader"
import Settings from "./Settings"
import Users from "./Users"

const UserContainer = () => {
	const [activeSettings, setActiveSettings] = useState<boolean>(false)

	return (
		<Container>
			<ProfileHeader setActiveSettings={setActiveSettings} />
			<Users />
			<Settings activeSettings={activeSettings} setActiveSettings={setActiveSettings} />
		</Container>
	)
}

const Container = styled.div`
	background-color: ${({ theme }) => theme.primaryColor};
	width: 450px;
	border-right: 1px solid ${({ theme }) => theme.lineBreakColor};
	display: flex;
	flex-direction: column;
	position: relative;
`

export default UserContainer
