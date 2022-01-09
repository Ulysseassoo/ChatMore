import React, { useEffect } from "react"
import { useAppSelector } from "../redux/hooks"
import { selectLoggedIn } from "../redux/user/userSlice"
import { supabase } from "../supabaseClient"
import { Main } from "../Theme/global"

import styled from "styled-components"
import Header from "../Components/Homepage/Header"
import UserContainer from "../Components/Homepage/UserContainer"
import ChatContainer from "../Components/Homepage/ChatContainer"

const Homepage: React.FC = () => {
	const selector = useAppSelector
	if (selector(selectLoggedIn) === false) {
		return <Main></Main>
	}
	return (
		<Main chat>
			<Header />
			<Container>
				<UserContainer />
				<ChatContainer />
			</Container>
		</Main>
	)
}

const Container = styled.div`
	width: 100%;
	display: flex;
	height: 100%;
`

export default Homepage
