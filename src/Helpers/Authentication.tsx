import React, { useEffect } from "react"
import { useNavigate } from "react-router"
import { useAppDispatch } from "../redux/hooks"
import { EmptyRooms } from "../redux/room/roomSlice"
import { logout, updateProfile, updateSession } from "../redux/user/userSlice"
import { supabase } from "../supabaseClient"

type Props = {
	children: React.ReactNode
}

const Authentication = ({ children }: Props) => {
	const navigate = useNavigate()
	const dispatch = useAppDispatch()

	const getUserProfile = async (user: any) => {
		try {
			let { error, data: newData }: { error: any; data: any } = await supabase.from("profiles").select("*").eq("id", user.id)
			dispatch(updateProfile(newData[0]))
		} catch (error) {
			console.log(error)
		}
	}

	useEffect(() => {
		const { data: listener } = supabase.auth.onAuthStateChange(async (event, session) => {
			console.log(event, session)
			switch (event) {
				case "SIGNED_OUT":
					dispatch(logout())
					dispatch(EmptyRooms())
					navigate("/login")
					break
				case "TOKEN_REFRESHED":
					const userSession: any = session?.user
					dispatch(updateSession(userSession))
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
		const userSession: any = session?.user
		dispatch(updateSession(userSession))
		getUserProfile(userSession)

		return () => {
			listener?.unsubscribe()
		}
	}, [])
	return <>{children}</>
}

export default Authentication
