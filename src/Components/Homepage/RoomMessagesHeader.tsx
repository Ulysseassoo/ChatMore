import { Flex, HStack, Icon, Avatar, Box, Text, Center } from "@chakra-ui/react";
import { useMemo } from "react";
import { useParams, useNavigate } from "react-router";
import useOnlineStore from "../../Store/onlineStore";
import useRoomStore from "../../Store/roomStore";
import useUserIsTypying from "../Hooks/useUserIsTypying";
import { BsThreeDotsVertical } from "react-icons/bs";
import useIsUserBlocked from "../Hooks/useIsUserBlocked";

const RoomMessagesHeader = () => {
	const navigation = useNavigate();
	const { id } = useParams<{ id: string }>();
	const rooms = useRoomStore((state) => state.rooms);
	const onlineUsers = useOnlineStore((state) => state.onlineUsers);

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
		<Box bg={"headerMenuColor"} px="4" py="3" w="full">
			<Flex justifyContent={"space-between"} alignItems="center" flexDir="row" position="relative" overflow="hidden">
				<HStack spacing={2} alignItems="center">
					{/* <Box onClick={navigation.goBack}>
						<Icon as={AntDesign} name="arrowleft" color="white" size={6} />
					</Box> */}
					<HStack alignItems={"center"} spacing="4" flex="1">
						<Avatar
							src={userToChat?.avatar_url !== "" ? userToChat.avatar_url : undefined}
							bg={"accentColor"}
							size={"sm"}
							name={userToChat?.username}
						/>
						<Box
							// _hover={{
							// 	bg: "lineBreakColor",
							// }}
							px="1.5"
							borderRadius={"md"}
							// onClick={() =>
							// 	// navigation.navigate("ProfileUser", {
							// 	// 	profile: userToChat,
							// 	// 	room_id: route.params.room_id
							// 	// })
							// }
							flex="1"
						>
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

				<HStack spacing="4" alignItems="center">
					<Center
						p="2"
						borderRadius="lg"
						_hover={{
							background: "whiteAlpha.100",
						}}
						cursor="pointer"
					>
						<Icon as={BsThreeDotsVertical} color={"white"} />
					</Center>
				</HStack>
			</Flex>
		</Box>
	);
};

export default RoomMessagesHeader;

function useRoute<T>() {
	throw new Error("Function not implemented.");
}
