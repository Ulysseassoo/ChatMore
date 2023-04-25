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
import AuthenticationWrapper from "./Components/AuthenticationWrapper";

const App: React.FC = () => {
	const router = createBrowserRouter([
		{
			path: "/",
			element: <AuthenticationWrapper />,
			children: [
				{ path: "/", element: <Homepage /> },
				{
					path: "/chat/:id",
					element: <Homepage />,
				},
				{
					path: "/login",
					element: <Login />,
				},
				{
					path: "/register",
					element: <Register />,
				},
			],
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
			<RouterProvider router={router} />
		</ChakraProvider>
	);
};

export default App;
