import { Box, Flex } from "@chakra-ui/react";
import React from "react";
import ChatUsersList from "./ChatUsersList";
import { useParams } from "react-router";
import RoomMessages from "./RoomMessages";
import SettingsHome from "./SettingsHome";
import useSettingsStore from "../../Store/settingsStore";
import ProfileInformations from "./ProfileInformations";

const MainContent = () => {
	const isSettingsActive = useSettingsStore((state) => state.isSettingsActive);

	return (
		<Flex
			gridArea="chat"
			boxShadow="#35312E 1.5px 1.5px 2px 4px;"
			borderRadius="0.75rem 0 0 0"
			background="primaryColor"
			position="relative"
			overflow="hidden"
			transition="0.3s ease"
		>
			{isSettingsActive && <SettingsHome />}
			<ChatUsersList />
			<RoomMessages />
			<ProfileInformations />
		</Flex>
	);
};

export default MainContent;
