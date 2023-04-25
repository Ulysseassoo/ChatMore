import styled from "styled-components";
import User from "./User";
import {
	Box,
	Center,
	Divider,
	Flex,
	Icon,
	Spinner,
	Text,
	chakra,
	shouldForwardProp,
	useBoolean,
} from "@chakra-ui/react";
import { memo, useEffect, useState } from "react";
import useAuthStore from "../../Store/authStore";
import useRoomStore from "../../Store/roomStore";
import { BiMessageSquareAdd } from "react-icons/bi";
import SearchBar from "./SearchBar";
import ChatUsersListItem from "./ChatUsersListItem";
import { motion, isValidMotionProp, AnimatePresence, useIsPresent } from "framer-motion";
import useSettingsStore from "../../Store/settingsStore";
import { supabase } from "../../supabaseClient";
import { Profile } from "../../Interface/Types";
import SearchUsersList from "./SearchUsersList";

const ChatUsersList = () => {
	const [searchMessages, setSearchMessages] = useState("");
	const getChatrooms = useRoomStore((state) => state.getChatrooms);
	const rooms = useRoomStore((state) => state.rooms);
	console.log("🚀 ~ file: ChatUsersList.tsx:31 ~ ChatUsersList ~ rooms:", rooms);
	const isLoading = useRoomStore((state) => state.isLoading);
	const session = useAuthStore((state) => state.session);
	const isContactResearchActive = useSettingsStore((state) => state.isContactResearchActive);
	const toggleContactResearch = useSettingsStore((state) => state.toggleContactResearch);

	useEffect(() => {
		if (session?.user !== undefined && isLoading) {
			getChatrooms(session.user);
		}
	}, [isLoading, session]);

	return (
		<>
			<Flex
				flexDir="column"
				p="4"
				w="30%"
				borderRight="1px solid"
				borderColor="lineBreakColor"
				gap="4"
				position="relative"
				overflow="hidden"
			>
				<Flex alignItems="center" justifyContent="space-between">
					<Text fontSize="2xl">Chat</Text>
					<Icon
						onClick={() => toggleContactResearch()}
						as={BiMessageSquareAdd}
						cursor="pointer"
						boxSize={5}
						color="white"
					/>
				</Flex>
				<SearchBar />
				{isLoading ? (
					<Center height="80%" width="full">
						<Spinner color={"accentColor"} size={"lg"} />
					</Center>
				) : (
					<Flex flexDir="column" flex="1" overflowY="scroll" gap="2">
						{rooms.length >= 1 ? (
							rooms
								.filter((item) => item.messages.length > 0)
								.map((room) => <ChatUsersListItem key={room.room} item={room} />)
						) : (
							<Text>
								You have no conversations. Start by clicking on the add button, and add someone to send him a message.
							</Text>
						)}
					</Flex>
				)}

				<AnimatePresence>{isContactResearchActive && <SearchUsersList key={"search"} />}</AnimatePresence>
			</Flex>
		</>
	);
};

export default ChatUsersList;
