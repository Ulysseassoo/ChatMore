import { Flex, HStack, Avatar, Box, Text, useMediaQuery, Icon } from "@chakra-ui/react";
import { useMemo } from "react";
import { useParams, useNavigate } from "react-router";
import useOnlineStore from "../../Store/onlineStore";
import useRoomStore from "../../Store/roomStore";
import useUserIsTypying from "../Hooks/useUserIsTypying";
import useIsUserBlocked from "../Hooks/useIsUserBlocked";
import useSettingsStore from "../../Store/settingsStore";
import { BsArrowLeft } from "react-icons/bs";

const RoomMessagesHeader = () => {
	const navigation = useNavigate();
	const { id } = useParams<{ id: string }>();
	const rooms = useRoomStore((state) => state.rooms);
	const onlineUsers = useOnlineStore((state) => state.onlineUsers);
	const setIsProfileActive = useSettingsStore((state) => state.setIsProfileActive);
	const [isIpad] = useMediaQuery("(max-width: 1025px)");
	const navigate = useNavigate();
	const isChat = id !== undefined;

	if (!id) return <></>;

	const actualRoom = rooms.find((roomState) => roomState.room === parseInt(id));
	const userIsTypying = useUserIsTypying(parseInt(id));
	const isUserBlocked = useIsUserBlocked(parseInt(id));
	const userToChat = actualRoom?.users[0];
	const isUserOnline = useMemo(() => {
		const isOnline = Object.keys(onlineUsers).find((userId) => userId === userToChat?.id);
		if (!isOnline) return false;
		return true;
	}, [onlineUsers, userToChat]);

	if (!userToChat) return <></>;

	return (
		<Box
			bg={"headerMenuColor"}
			px="4"
			py="3"
			w="full"
			gridArea="top"
			cursor={"pointer"}
			_hover={{
				bg: "lineBreakColor",
			}}
			transition="0.3s ease"
			onClick={() => setIsProfileActive(true)}
		>
			<Flex justifyContent={"space-between"} alignItems="center" flexDir="row" position="relative" overflow="hidden">
				<HStack spacing={2} alignItems="center">
					{isChat && isIpad && (
						<Icon
							cursor={"pointer"}
							as={BsArrowLeft}
							boxSize={6}
							onClick={(e) => {
								e.stopPropagation();
								navigate("/");
								setIsProfileActive(false);
							}}
						/>
					)}
					<HStack alignItems={"center"} spacing="4" flex="1">
						<Avatar
							src={userToChat?.avatar_url !== "" ? userToChat.avatar_url : undefined}
							bg={"accentColor"}
							size={"sm"}
							name={userToChat?.username}
						/>
						<Box px="1.5" borderRadius={"md"} flex="1">
							<Text color="white" fontSize="md" fontWeight="bold">
								{userToChat.username}
							</Text>
							{!isUserBlocked.isRoomBlocked && !userIsTypying && (
								<HStack spacing="1" alignItems={"center"}>
									<Box height="2" width="2" borderRadius={"full"} bg={isUserOnline ? "green.500" : "red.500"} />
									<Text fontSize={"xs"} color="white">
										{isUserOnline ? "Online" : "Offline"}
									</Text>
								</HStack>
							)}
							{!isUserBlocked.isRoomBlocked && userIsTypying && (
								<Text color="white" fontSize={"xs"}>
									Is writing...
								</Text>
							)}
						</Box>
					</HStack>
				</HStack>
			</Flex>
		</Box>
	);
};

export default RoomMessagesHeader;
