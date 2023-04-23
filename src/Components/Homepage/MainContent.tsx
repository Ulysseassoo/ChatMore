import { Box, Flex } from "@chakra-ui/react";
import React from "react";
import ChatUsersList from "./ChatUsersList";

const MainContent = () => {
	return (
		<Flex
			gridArea="chat"
			boxShadow="#35312E 1.5px 1.5px 2px 4px;"
			borderRadius="0.75rem 0 0 0"
			background="primaryColor"
			p="2"
		>
			<ChatUsersList />
		</Flex>
	);
};

export default MainContent;
