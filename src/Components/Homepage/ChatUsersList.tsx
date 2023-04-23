import styled from "styled-components";
import User from "./User";
import { Box, Center, Flex, Icon, Spinner, Text } from "@chakra-ui/react";
import { useEffect } from "react";
import useAuthStore from "../../Store/authStore";
import useRoomStore from "../../Store/roomStore";
import { BiMessageSquareAdd } from "react-icons/bi";
import SearchBar from "./SearchBar";

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

	// if (isLoading) {
	// 	return (
	// 		<Center height="80%" width="full">
	// 			<Spinner color={"accentColor"} size={"lg"} />
	// 		</Center>
	// 	);
	// }

	return (
		<Flex flexDir="column" p="4" w="30%" borderRight="1px solid" borderColor="lineBreakColor" gap="4">
			<Flex alignItems="center" justifyContent="space-between">
				<Text fontSize="2xl">Chat</Text>
				<Icon as={BiMessageSquareAdd} cursor="pointer" boxSize={5} color="white" />
			</Flex>
			<SearchBar />
			{/* {chatRooms.map((room) => {
				if (room.messages.length !== 0) {
					return (
						<User
							username={room.users[0].username}
							avatar_url={room.users[0].avatar_url}
							created_at={room.messages[0].created_at}
							room_id={room.room}
							key={room.room}
							view={room.messages[0].view!}
							message_user_id={room.messages[0].user}
							last_message={room.messages[0].content}
							images={room.messages[0].images}
							chat
						/>
					)
				}
			})} */}
		</Flex>
	);
};

export default ChatUsersList;
