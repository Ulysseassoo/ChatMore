import React, { useMemo } from "react";
import { RoomState } from "../../Store/roomStore";
import { useNavigate } from "react-router";
import useAuthStore from "../../Store/authStore";
import useUserIsTypying from "../Hooks/useUserIsTypying";
import { Avatar, Badge, Box, Flex, HStack, Icon, Text } from "@chakra-ui/react";
import { dateFormatted } from "../../Helpers/DateFormatting";
import { IoCheckmarkDoneSharp, IoImagesSharp } from "react-icons/io5";

interface Props {
	item: RoomState;
}

const ChatUsersListItem = ({ item }: Props) => {
	const user = item.users[0];
	const navigation = useNavigate();
	const session = useAuthStore((state) => state.session);
	const actualMessage = useMemo(() => item.messages[0].messages[0], [item.messages]);
	// const isUserBlocked = useIsUserBlocked(item.room)

	const goToUserRoom = (roomId: number) => {
		navigation(`/chat/${roomId}`);
	};

	const isUserTypying = useUserIsTypying(item.room);

	const isFromConnectedUser = actualMessage.user === session?.user.id;

	const getNotViewedMessages = (user_id: string | undefined) => {
		const count = item.messages
			.map((dateMessage) =>
				dateMessage.messages.filter((message) => {
					if (message.user !== user_id) return message.view === false;
				}),
			)
			.filter((mess) => mess.length > 0);
		return count.length;
	};

	return (
		<Box width={"full"} position="relative">
			<Box
				onClick={() => {
					goToUserRoom(item.room);
				}}
				_pressed={{
					bg: "lineBreakColor",
				}}
				p="4"
			>
				<HStack spacing="4" alignItems={"center"}>
					<Avatar
						src={user.avatar_url !== "" ? user.avatar_url : undefined}
						height="10"
						width="10"
						borderRadius={"full"}
						bg="yellow.500"
						name={user.username && user?.username[0].toUpperCase() + user?.username[1].toUpperCase()}
					/>

					<Flex justifyContent={"space-between"} width={"full"} pr="16">
						<Flex justifyContent={"space-between"} alignItems="center" flexDir="row">
							<Text color="white" fontWeight={"bold"}>
								{user.username}
							</Text>

							{actualMessage.created_at && (
								<Text color="white" fontSize={"xs"}>
									{dateFormatted(actualMessage.created_at)}
								</Text>
							)}
						</Flex>
						<Flex justifyContent={"space-between"} flexDir="row">
							<HStack alignItems="center" spacing="1">
								{isFromConnectedUser && (
									<Icon as={IoCheckmarkDoneSharp} color={actualMessage.view ? "accentColor" : "gray.500"} />
								)}
								<Text
									color={isUserTypying ? "accentColor" : "gray.400"}
									isTruncated
									display="flex"
									flexDir="row"
									alignItems="center"
								>
									{isUserTypying ? "Is writing..." : actualMessage.content}
								</Text>
								{actualMessage.images !== undefined && actualMessage.images.length > 0 && (
									<HStack alignItems="center" spacing="1">
										<Icon as={IoImagesSharp} color="gray.500" size={4} />
										<Text color={isUserTypying ? "accentColor" : "gray.400"}>Image</Text>
									</HStack>
								)}
							</HStack>
							{getNotViewedMessages(session?.user.id) > 0 && (
								<Badge bg={"accentColor"} color="white" fontSize={"2xs"} borderRadius={"full"}>
									{getNotViewedMessages(session?.user.id)}
								</Badge>
							)}
						</Flex>
					</Flex>
				</HStack>
			</Box>
		</Box>
	);
};

export default ChatUsersListItem;
