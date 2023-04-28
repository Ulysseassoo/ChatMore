import { Box, Center, Flex, Text, useToast } from "@chakra-ui/react";
import React, { useEffect, useMemo } from "react";
import { useParams } from "react-router";
import useRoomStore from "../../Store/roomStore";
import useAuthStore from "../../Store/authStore";
import { supabase } from "../../supabaseClient";
import useIsUserBlocked from "../Hooks/useIsUserBlocked";
import ChatMessage from "./ChatMessage";
import ChatDate from "./ChatDate";
import { UserHasBlockedDelete, deleteUserBlock, updateRoomMessages } from "../../Services/APIs";
import { Message } from "../../Interface/Types";

const RoomMessagesContent = () => {
	const { id } = useParams<{ id: string }>();
	const rooms = useRoomStore((state) => state.rooms);
	const deleteBlockedUser = useRoomStore((state) => state.deleteBlockedUser);
	const session = useAuthStore((state) => state.session);
	const profile = useAuthStore((state) => state.profile);
	const updateViewRoomMessages = useRoomStore((state) => state.updateViewRoomMessages);
	const channels = supabase.getChannels();
	const toast = useToast();

	if (!id) return <></>;

	const actualRoom = rooms.find((roomState) => roomState.room === parseInt(id));

	if (!actualRoom || !profile) return <></>;

	const unblockUser = async () => {
		const deleteUsers: UserHasBlockedDelete = {
			blocking_user_id: session?.user.id,
			room_id: parseInt(id),
		};

		try {
			await deleteUserBlock(deleteUsers);
			// Delete store
			deleteBlockedUser(parseInt(id), profile.id);
			if (getChannelRoom !== null) {
				getChannelRoom.send({
					type: "broadcast",

					event: "deleteBlock",

					payload: { room_id: parseInt(id), profile_id: profile?.id },
				});
			}
			toast({
				title: "Success",
				description: `${profile?.username} has been unblocked !`,
				status: "success",
				duration: 1500,
				isClosable: true,
				position: "top-right",
			});
		} catch (error: any) {
			console.log(error);
		}
	};

	const getNotViewedMessages = () => {
		const messagesFormatted: Message[] = [];
		actualRoom.messages
			.map((dateMessage) =>
				dateMessage.messages.filter((message) => {
					if (message.user !== session?.user.id) return message.view === false;
				}),
			)
			.filter((mess) => mess.length > 0)
			.map((mapArray) =>
				mapArray.map(({ images, ...rest }) => {
					const newMessage = { ...rest };
					messagesFormatted.push(newMessage);
				}),
			);

		return messagesFormatted;
	};

	const setViewedMessage = () => {
		const notViewedMessages = getNotViewedMessages();
		if (notViewedMessages.length === 0) return [];
		const viewedMessages = notViewedMessages.map((message) => {
			message.view = true;
			return message;
		});
		return viewedMessages;
	};

	const updateUserMessages = async () => {
		try {
			const viewedMessages = setViewedMessage();
			if (viewedMessages.length === 0) return;
			const messages = await updateRoomMessages(viewedMessages);
			return messages;
		} catch (error) {
			console.log(error);
		}
	};

	const updateMessagesInRoom = async () => {
		try {
			const messages = await updateUserMessages();
			if (messages === undefined) return;
			updateViewRoomMessages(messages, session?.user.id);
			if (getChannelRoom !== null) {
				getChannelRoom.send({
					type: "broadcast",
					event: "readMessages",
					payload: { messages },
				});
			}
		} catch (error) {
			console.log(error);
		}
	};

	useEffect(() => {
		updateMessagesInRoom();
	}, [actualRoom.messages]);

	const isUserBlocked = useIsUserBlocked(actualRoom.room);
	const getChannelRoom = useMemo(() => {
		const channelRoom = channels.find((chan) => chan.topic.split(":")[1] === `room${actualRoom?.room.toString()}`);
		if (channelRoom) return channelRoom;
		return null;
	}, [channels]);

	return (
		<Box bg={"primaryColor"} height="full" position="relative" paddingBottom={2} gridArea="content">
			<Flex px="4" flexDir="column-reverse" pb="1" height="full" width="full" overflow="scroll">
				{actualRoom?.messages.map((dateMessage) => (
					<Flex flexDir="column" w="full" my="1" px="4" key={dateMessage.id}>
						<ChatDate date={dateMessage.date} />
						<Flex flexDir="column-reverse">
							{dateMessage.messages.map((message) => (
								<ChatMessage key={message.id} item={message} />
							))}
						</Flex>
					</Flex>
				))}
				{isUserBlocked.hasConnectedUserBlockedRoom && (
					<Center>
						<Box
							_hover={{
								bg: "lineBreakColor",
							}}
							textAlign={"center"}
							my="2.5"
							shadow="6"
							onClick={unblockUser}
							py="2"
							px="4"
							bg={"headerMenuColor"}
							borderRadius="md"
						>
							<Text color={"textColor"} fontSize="xs">
								You have blocked this user. Click here to unblock him.
							</Text>
						</Box>
					</Center>
				)}
			</Flex>
		</Box>
	);
};

export default RoomMessagesContent;