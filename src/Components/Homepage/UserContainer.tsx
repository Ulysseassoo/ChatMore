import { useEffect, useState } from "react"
import { useLocation } from "react-router"
import styled from "styled-components"
import { useAppDispatch, useAppSelector } from "../../redux/hooks"
import { addMessageToRoom, selectRooms } from "../../redux/room/roomSlice"
import { supabase } from "../../supabaseClient"
import ProfileHeader from "./ProfileHeader"
import SearchBar from "./SearchBar"
import Settings from "./Settings"
import Users from "./Users"

type ContainerProps = {
	location: string
}

const UserContainer = () => {
	const [activeSettings, setActiveSettings] = useState<boolean>(false)
	const { pathname } = useLocation()
	return (
		<Container location={pathname}>
			<ProfileHeader setActiveSettings={setActiveSettings} />
			<SearchBar />
			<Users />
			<Settings activeSettings={activeSettings} setActiveSettings={setActiveSettings} />
		</Container>
	)
}

const Container = styled.div<ContainerProps>`
	background-color: ${({ theme }) => theme.primaryColor};
	width: 450px;
	border-right: 1px solid ${({ theme }) => theme.lineBreakColor};
	display: flex;
	flex-direction: column;
	position: relative;
	@media screen and (max-width: 910px) {
		/* display: ${({ location }) => (location !== "/" ? "none" : "flex")}; */
		width: 100%;
	}
`

export default UserContainer
