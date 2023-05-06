import React, { useMemo } from "react";
import { RoomState } from "../../Store/roomStore";
import { useNavigate, useParams } from "react-router";
import useAuthStore from "../../Store/authStore";
import useUserIsTypying from "../Hooks/useUserIsTypying";
import { Avatar, Badge, Box, Flex, HStack, Icon, Text } from "@chakra-ui/react";
import { dateFormatted } from "../../Helpers/DateFormatting";
import { IoCheckmarkDoneSharp, IoImagesSharp } from "react-icons/io5";
import useIsUserBlocked from "../Hooks/useIsUserBlocked";
import { ChakraText } from "../../Framer";

interface Props {
	item: RoomState;
}

const ChatUsersListItem = ({ item }: Props) => {
	const { id } = useParams();
	const user = item.users[0];
	const navigation = useNavigate();
	const session = useAuthStore((state) => state.session);
	const actualMessage = useMemo(() => item.messages[0].messages[0], [item.messages]);
	const isUserBlocked = useIsUserBlocked(item.room);

	const goToUserRoom = (roomId: number) => {
		navigation(`/chat/${roomId}`);
	};

	const isUserTypying = useUserIsTypying(item.room);

	const isFromConnectedUser = actualMessage.user === session?.user.id;

	const getNotViewedMessages = (user_id: string | undefined) => {
		const count = item.messages.reduce((acc, dateMessage) => {
			const unreadCount = dateMessage.messages.reduce((unreadAcc, message) => {
				if (message.user !== user_id && message.view === false) {
					return unreadAcc + 1;
				} else {
					return unreadAcc;
				}
			}, 0);
			return acc + unreadCount;
		}, 0);
		return count;
	};

	return (
		<Box
			width={"full"}
			borderRadius="lg"
			position="relative"
			background={id && item.room === parseInt(id) ? "lineBreakColor" : "transparent"}
			_hover={{
				bg: "lineBreakColor",
			}}
			cursor="pointer"
			transition="0.3s ease"
		>
			<Box
				onClick={() => {
					goToUserRoom(item.room);
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

					<Flex flexDir="column" justifyContent={"space-between"} width={"full"} overflow="hidden">
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
						<Flex justifyContent={"space-between"} flexDir="row" w="full">
							<HStack alignItems="center" spacing="1" maxW="full">
								{isFromConnectedUser && (
									<Icon as={IoCheckmarkDoneSharp} color={actualMessage.view ? "accentColor" : "gray.500"} />
								)}
								<Text color={"gray.400"} isTruncated display="flex" flexDir="row" alignItems="center">
									{isUserTypying ? (
										<ChakraText
											animate={{ opacity: [1, 0.5, 0.3, 0.8] }}
											// @ts-ignore
											transition={{
												duration: 0.8,
												ease: "easeInOut",
												repeat: Infinity,
												repeatDelay: 0.6,
											}}
											color="accentColor"
										>
											Is writing...
										</ChakraText>
									) : (
										actualMessage.content
									)}
								</Text>
								{actualMessage.images !== undefined && actualMessage.images.length > 0 && (
									<HStack alignItems="center" spacing="1">
										<Icon as={IoImagesSharp} color="gray.500" size={4} />
										<Text color={isUserTypying ? "accentColor" : "gray.400"}>Image</Text>
									</HStack>
								)}
							</HStack>
							{getNotViewedMessages(session?.user.id) > 0 && (
								<Badge
									display="flex"
									alignItems={"center"}
									justifyContent={"center"}
									bg={"accentColor"}
									color="white"
									fontSize={"2xs"}
									borderRadius={"full"}
									h="20px"
									w="20px"
								>
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
