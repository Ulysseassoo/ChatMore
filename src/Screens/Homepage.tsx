import React, { useEffect } from "react"
import { useAppSelector } from "../redux/hooks"
import { selectUser } from "../redux/user/userSlice"
import { supabase } from "../supabaseClient"
import { Main } from "../Theme/global"

import styled from "styled-components"
import Header from "../Components/Homepage/Header"

const Homepage: React.FC = () => {
	const selector = useAppSelector
	// {selector(selectUser) && selector(selectUser).id}
	// <a onClick={() => supabase.auth.signOut()}>Logout</a>

	return (
		<Main chat>
			<Header />
		</Main>
	)
}

export default Homepage
