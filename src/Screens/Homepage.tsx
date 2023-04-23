import React, { useEffect } from "react";
import { Main } from "../Theme/global";

import styled from "styled-components";
import Header from "../Components/Homepage/Header";
import { Box, Grid } from "@chakra-ui/react";
import Sidebar from "../Components/Sidebar";
// import UserContainer from "../Components/Homepage/UserContainer";
// import ChatContainer from "../Components/Homepage/ChatContainer";
// import ProfilContainer from "../Components/Homepage/ProfilContainer";

const Homepage: React.FC = () => {
	return (
		<Grid
			as="main"
			height="100vh"
			gridTemplateColumns={"40px 1fr 1fr"}
			gridTemplateRows="40px 1fr 1fr"
			gridTemplateAreas={`
		"header header header"
		"sidebar chat chat"
		"sidebar chat chat"`}
		>
			<Header />
			<Sidebar />
			{/* <Container> */}
			{/* <UserContainer />
				<ChatContainer />
				<ProfilContainer /> */}
			{/* </Container> */}
		</Grid>
	);
};

export default Homepage;
