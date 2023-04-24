import styled from "styled-components";
import User from "./User";
import { Box, Center, Flex, Icon, Spinner, Text } from "@chakra-ui/react";
import { useEffect } from "react";
import useAuthStore from "../../Store/authStore";
import useRoomStore from "../../Store/roomStore";
import { BiMessageSquareAdd } from "react-icons/bi";
import SearchBar from "./SearchBar";
import ChatUsersListItem from "./ChatUsersListItem";

const ChatUsersList = () => {
	const getChatrooms = useRoomStore((state) => state.getChatrooms);
	const rooms = useRoomStore((state) => state.rooms);
	const isLoading = useRoomStore((state) => state.isLoading);
	const session = useAuthStore((state) => state.session);

	useEffect(() => {
		if (session?.user !== undefined && isLoading) {
			getChatrooms(session.user);
		}
	}, [isLoading, session]);

	return (
		<Flex flexDir="column" p="4" w="30%" borderRight="1px solid" borderColor="lineBreakColor" gap="4">
			<Flex alignItems="center" justifyContent="space-between">
				<Text fontSize="2xl">Chat</Text>
				<Icon as={BiMessageSquareAdd} cursor="pointer" boxSize={5} color="white" />
			</Flex>
			<SearchBar />
			{isLoading ? (
				<Center height="80%" width="full">
					<Spinner color={"accentColor"} size={"lg"} />
				</Center>
			) : (
				<Box flex="1" overflowY="scroll">
					{rooms.length > 1 ? (
						rooms.map((room) => <ChatUsersListItem key={room.room} item={room} />)
					) : (
						<Text>
							You have no conversations. Start by clicking on the add button, and add someone to send him a message.
						</Text>
					)}
				</Box>
			)}
		</Flex>
	);
};

export default ChatUsersList;
