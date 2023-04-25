import { Box, Flex, Image, Text } from "@chakra-ui/react";
import BackgroundImage from "../../assets/ChatImage.png";
import React from "react";
import { useParams } from "react-router";
import RoomMessagesHeader from "./RoomMessagesHeader";

const RoomMessages = () => {
	const params = useParams<{ id?: string }>();

	if (params.id !== undefined) {
		return (
			<Flex flexDir="column" w="70%" gap="4" position="relative" overflow="hidden" h="full">
				<RoomMessagesHeader />
			</Flex>
		);
	}

	return (
		<Flex
			flexDir="column"
			p="4"
			w="70%"
			borderRight="1px solid"
			borderColor="lineBreakColor"
			gap="4"
			position="relative"
			overflow="hidden"
			h="full"
			justifyContent="center"
			alignItems="center"
		>
			<Box h="450px" width="450px" display="flex" alignItems="center" flexDir="column">
				<Image src={BackgroundImage} alt="Image starting a chat" />
				<Text as="p" color="white" fontSize="md">
					Start a conversation by clicking on any discussion !
				</Text>
				<Text as="span" color="secondaryColor">
					You can also invite your friends to chat with them here.
				</Text>
			</Box>
		</Flex>
	);
};

export default RoomMessages;