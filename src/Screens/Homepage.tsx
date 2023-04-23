import React from "react";

import Header from "../Components/Homepage/Header";
import { Grid } from "@chakra-ui/react";
import Sidebar from "../Components/Sidebar";
import MainContent from "../Components/Homepage/MainContent";

const Homepage: React.FC = () => {
	return (
		<Grid
			as="main"
			height="100vh"
			background="rgba(43, 40, 38, 1)"
			gridTemplateColumns={"50px 1fr 1fr"}
			gridTemplateRows="50px 1fr 1fr"
			gridTemplateAreas={`
		"header header header"
		"sidebar chat chat"
		"sidebar chat chat"`}
		>
			<Header />
			<Sidebar />
			<MainContent />
		</Grid>
	);
};

export default Homepage;
