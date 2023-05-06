import { Box, Flex, Grid, Image, Text, useMediaQuery } from "@chakra-ui/react";
import BackgroundImage from "../../assets/ChatImage.png";
import React from "react";
import { useParams } from "react-router";
import RoomMessagesHeader from "./RoomMessagesHeader";
import RoomMessagesContent from "./RoomMessagesContent";
import RoomMessagesBottom from "./RoomMessagesBottom";
import useSettingsStore from "../../Store/settingsStore";

const RoomMessages = () => {
	const params = useParams<{ id?: string }>();
	const [isIpad] = useMediaQuery("(max-width: 1025px)");

	if (params.id !== undefined) {
		return (
			<Grid
				gridTemplateColumns="1fr 1fr 1fr"
				gridTemplateRows={"66px 1fr 1fr 64px"}
				gridTemplateAreas={`
	"top top top"
"content content content"
"content content content"
"bottom bottom bottom"
`}
				flexDir="column"
				flex="1"
				position="relative"
				overflow="hidden"
				h="full"
				transition="0.3s ease"
			>
				<RoomMessagesHeader />
				<RoomMessagesContent />
				<RoomMessagesBottom />
			</Grid>
		);
	}

	return (
		<Flex
			flexDir="column"
			p="4"
			w={"70%"}
			borderRight="1px solid"
			borderColor="lineBreakColor"
			gap="4"
			position="relative"
			overflow="hidden"
			h="full"
			justifyContent="center"
			alignItems="center"
			display={isIpad ? "none" : "flex"}
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
