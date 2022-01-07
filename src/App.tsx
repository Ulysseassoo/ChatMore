import { AnimatePresence } from "framer-motion"
import React, { useEffect, useState } from "react"
import { Route, Routes } from "react-router"
import { ToastContainer } from "react-toastify"
import { ThemeProvider } from "styled-components"
import Homepage from "./Screens/Homepage"
import Login from "./Screens/Login"
import Register from "./Screens/Register"
import { GlobalStyles } from "./Theme/global"
import { lightTheme } from "./Theme/theme"
import { useLocation } from "react-router-dom"
import "react-toastify/dist/ReactToastify.css"
import { supabase } from "./supabaseClient"

const App: React.FC = () => {
	const location = useLocation()

	// const [session, setSession] = useState(null)

	// useEffect(() => {
	//   setSession(supabase.auth.session())

	//   supabase.auth.onAuthStateChange((_event, session) => {
	// 	setSession(session)
	//   })
	// }, [])

	return (
		<ThemeProvider theme={lightTheme}>
			<GlobalStyles />
			<ToastContainer />
			<AnimatePresence exitBeforeEnter initial={false}>
				{/* In order that the animations knows that we changed pages */}
				<Routes location={location} key={location.pathname}>
					<Route path="/" element={<Homepage />} />
					<Route path="/login" element={<Login />} />
					<Route path="/register" element={<Register />} />
				</Routes>
			</AnimatePresence>
		</ThemeProvider>
	)
}

export default App
