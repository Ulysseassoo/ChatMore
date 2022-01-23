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
import Authentication from "./Helpers/Authentication"
import TablesListeners from "./Helpers/TablesListeners"

const App: React.FC = () => {
	const location = useLocation()

	return (
		<ThemeProvider theme={lightTheme}>
			<Authentication>
				<TablesListeners>
					<GlobalStyles />
					<ToastContainer />
					<AnimatePresence exitBeforeEnter initial={false}>
						{/* In order that the animations knows that we changed pages */}
						<Routes location={location} key={location.pathname}>
							<Route path="/" element={<Homepage />} />
							<Route path="/:id" element={<Homepage />} />
							<Route path="/login" element={<Login />} />
							<Route path="/register" element={<Register />} />
						</Routes>
					</AnimatePresence>
				</TablesListeners>
			</Authentication>
		</ThemeProvider>
	)
}

export default App
