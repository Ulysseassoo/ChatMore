import React, { useEffect } from "react"
import { useAppSelector } from "../redux/hooks"
import { selectLoggedIn, selectUser } from "../redux/user/userSlice"
import { supabase } from "../supabaseClient"
import { Main } from "../Theme/global"

const Homepage: React.FC = () => {
	const selector = useAppSelector

	return (
		<Main>
			{selector(selectLoggedIn) && selector(selectUser).id}
			<a onClick={() => supabase.auth.signOut()}>Logout</a>
		</Main>
	)
}

export default Homepage
