import React, { useEffect } from "react"
import { useNavigate } from "react-router"
import { useAppDispatch } from "../redux/hooks"
import { logout, update } from "../redux/user/userSlice"
import { supabase } from "../supabaseClient"

type Props = {
	children: React.ReactNode
}

const Authentication = ({ children }: Props) => {
	const navigate = useNavigate()
	const dispatch = useAppDispatch()

	useEffect(() => {
		const { data: listener } = supabase.auth.onAuthStateChange(async (event, session) => {
			console.log(event, session)
			switch (event) {
				case "SIGNED_OUT":
					dispatch(logout())
					navigate("/login")
					break
				default:
					break
			}
		})
		// Check active session and set user
		const session = supabase.auth.session()
		if (!session) {
			navigate("/login")
			return
		}
		// Update the user data if session is active
		const user: any = session?.user
		dispatch(update(user))

		return () => {
			listener?.unsubscribe()
		}
	}, [])
	return <>{children}</>
}

export default Authentication
