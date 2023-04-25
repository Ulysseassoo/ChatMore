import React from "react";
import { Profile } from "../../Interface/Types";
import { Avatar, Box, Flex, HStack, Text } from "@chakra-ui/react";
import { useNavigate } from "react-router";
import { supabase } from "../../supabaseClient";
import useRoomStore, { RoomState } from "../../Store/roomStore";
import useAuthStore from "../../Store/authStore";
import useRooms from "../Hooks/useRooms";
import useSettingsStore from "../../Store/settingsStore";

interface Props {
	profile: Profile;
}

const SearchUsersListItem = ({ profile }: Props) => {
	const navigate = useNavigate();
	const useGetRooms = useRooms();
	const toggleContactResearch = useSettingsStore((state) => state.toggleContactResearch);

	const goToUserRoom = async (username: string | undefined) => {
		const room = await useGetRooms.getUserRoom(username);
		toggleContactResearch();
		navigate(`/chat/${room.room}`);
	};

	return (
		<Box
			p="2"
			width="full"
			mb={2}
			cursor="pointer"
			onClick={() => {
				goToUserRoom(profile.username);
			}}
			_hover={{
				bg: "lineBreakColor",
			}}
			borderRadius="xl"
		>
			<Box px="4" py="2">
				<HStack spacing="4" alignItems={"center"}>
					<Avatar
						src={profile.avatar_url !== "" ? profile.avatar_url : undefined}
						height="10"
						width="10"
						borderRadius={"full"}
						bg="yellow.500"
						name={profile.username}
					/>

					<Flex justifyContent={"space-between"}>
						<Text color="white" fontWeight={"bold"}>
							{profile.username}
						</Text>
						<Text color="gray.400" isTruncated maxW={"xs"}>
							{profile.about}
						</Text>
					</Flex>
				</HStack>
			</Box>
		</Box>
	);
};

export default SearchUsersListItem;
