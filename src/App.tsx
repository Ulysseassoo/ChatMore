import { AnimatePresence } from "framer-motion";
import React, {} from "react";
import { Route, RouterProvider, Routes } from "react-router";
import Homepage from "./Screens/Homepage";
import Login from "./Screens/Login";
import Register from "./Screens/Register";
import { createBrowserRouter, useLocation } from "react-router-dom";
import "react-toastify/dist/ReactToastify.css";
import { ChakraProvider } from "@chakra-ui/react";
import GlobalTheme from "./Theme/theme";

const App: React.FC = () => {
	const router = createBrowserRouter([
		{ path: "/", element: <Homepage key="homepage" /> },
		{
			path: "/:id",
			element: <Homepage key="homepage-id" />,
		},
		{
			path: "/login",
			element: <Login key="login" />,
		},
		{
			path: "/register",
			element: <Register key="register" />,
		},
	]);

	// return (
	// 	<ChakraProvider theme={GlobalTheme}>
	// 		{/* <Authentication> */}
	// 			{/* In order that the animations knows that we changed pages */}
	// 			<Routes location={location} key={location.pathname}>
	// 				<Route path="/" element={<Homepage />} />
	// 				<Route path="/:id" element={<Homepage />} />
	// 				<Route path="/login" element={<Login />} />
	// 				<Route path="/register" element={<Register />} />
	// 			</Routes>
	// 		</AnimatePresence>
	// 		{/* </Authentication> */}
	// 	</ChakraProvider>
	// );

	return (
		<ChakraProvider theme={GlobalTheme}>
			<AnimatePresence mode="wait" initial={false}>
				<RouterProvider router={router} />
			</AnimatePresence>
		</ChakraProvider>
	);
};

export default App;
