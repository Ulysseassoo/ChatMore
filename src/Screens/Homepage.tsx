import React, { useEffect } from "react";
import { Main } from "../Theme/global";
import TablesListeners from "../Helpers/TablesListeners";

import styled from "styled-components";
import Header from "../Components/Homepage/Header";
import UserContainer from "../Components/Homepage/UserContainer";
import ChatContainer from "../Components/Homepage/ChatContainer";
import ProfilContainer from "../Components/Homepage/ProfilContainer";

const Homepage: React.FC = () => {
	// const selector = useAppSelector

	// if (selector(selectLoggedIn) === false) {
	// 	return <Main></Main>
	// }

	// Check in Realtime if we receive a new message
	return (
		<></>
		// <TablesListeners>
		// 	<Main chat>
		// 		<Header />
		// 		<Container>
		// 			<UserContainer />
		// 			<ChatContainer />
		// 			<ProfilContainer />
		// 		</Container>
		// 	</Main>
		// </TablesListeners>
	);
};

const Container = styled.div`
	width: 100%;
	display: flex;
	height: 100%;
	position: relative;
`;

export default Homepage;
