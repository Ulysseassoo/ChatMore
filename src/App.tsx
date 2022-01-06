import React from "react"
import { Route, Routes } from "react-router"
import { ThemeProvider } from "styled-components"
import Homepage from "./Screens/Homepage"
import Login from "./Screens/Login"
import Register from "./Screens/Register"
import { GlobalStyles } from "./Theme/global"
import { lightTheme } from "./Theme/theme"

const App: React.FC = () => {
	return (
		<ThemeProvider theme={lightTheme}>
			<GlobalStyles />
			<Routes>
				<Route path="/" element={<Homepage />} />
				<Route path="/login" element={<Login />} />
				<Route path="/register" element={<Register />} />
			</Routes>
		</ThemeProvider>
	)
}

export default App
