import {
	Avatar,
	Box,
	Button,
	Center,
	Flex,
	HStack,
	Icon,
	Modal,
	ModalBody,
	ModalCloseButton,
	ModalContent,
	ModalFooter,
	ModalHeader,
	ModalOverlay,
	Text,
	VStack,
	useDisclosure,
	useMediaQuery,
	useToast,
} from "@chakra-ui/react";
import { IoMdClose } from "react-icons/io";
import React, { useMemo, useState } from "react";
import useSettingsStore from "../../Store/settingsStore";
import useRoomStore, { RoomState } from "../../Store/roomStore";
import { useParams } from "react-router";
import { supabase } from "../../supabaseClient";
import useIsUserBlocked from "../Hooks/useIsUserBlocked";
import { UserHasBlockedDelete, createUserBlock, deleteUserBlock } from "../../Services/APIs";
import useAuthStore from "../../Store/authStore";
import { BiBlock } from "react-icons/bi";

const ProfileInformations = () => {
	const { id } = useParams<{ id: string }>();
	const session = useAuthStore((state) => state.session);
	const profile = useAuthStore((state) => state.profile);
	const setIsProfileActive = useSettingsStore((state) => state.setIsProfileActive);
	const isProfileActive = useSettingsStore((state) => state.isProfileActive);
	const rooms = useRoomStore((state) => state.rooms);
	const deleteBlockedUser = useRoomStore((state) => state.deleteBlockedUser);
	const addBlockedUser = useRoomStore((state) => state.addBlockedUser);
	const isUserBlocked = useIsUserBlocked(parseInt(id!));
	const { isOpen, onOpen, onClose } = useDisclosure();
	const channels = supabase.getChannels();
	const isChat = id !== undefined;
	const getChannelRoom = useMemo(() => {
		const channelRoom = channels.find((chan) => chan.topic.split(":")[1] === `room${id?.toString()}`);
		if (channelRoom) return channelRoom;
		return null;
	}, [channels]);
	const toast = useToast();
	const [isIpad] = useMediaQuery("(max-width: 1025px)");

	const actualRoom = rooms.find((roomState) => roomState.room === parseInt(id!));

	if (!actualRoom) return <></>;

	const user = actualRoom.users[0];

	const unblockUser = async () => {
		if (id !== undefined) {
			const deleteUsers: UserHasBlockedDelete = {
				blocking_user_id: session?.user.id,
				room_id: parseInt(id),
			};

			try {
				await deleteUserBlock(deleteUsers);
				// Delete store
				deleteBlockedUser(parseInt(id), profile?.id);
				if (getChannelRoom !== null) {
					getChannelRoom.send({
						type: "broadcast",

						event: "deleteBlock",

						payload: { room_id: id, profile_id: profile?.id },
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
		}
	};

	const blockUser = async () => {
		if (id !== undefined) {
			const update = {
				blocking_user_id: session?.user.id!,
				created_at: new Date().toISOString(),
				room_id: parseInt(id),
			};
			try {
				const createBlockRelation = await createUserBlock(update);
				// Add store
				if (createBlockRelation !== undefined) {
					addBlockedUser(createBlockRelation);
					if (getChannelRoom !== null) {
						getChannelRoom.send({
							type: "broadcast",

							event: "addBlock",

							payload: { userBlock: createBlockRelation },
						});
					}
					toast({
						title: "Success",
						description: `${profile?.username} has been blocked !`,
						status: "success",
						duration: 1500,
						isClosable: true,
						position: "top-right",
					});
					onClose();
				}
			} catch (error) {
				toast({
					title: "Error",
					description: "User couldn't be blocked. Restart later.",
					status: "error",
					duration: 1500,
					isClosable: true,
					position: "top-right",
				});
			}
		}
	};

	const blockButton = () => {
		if (isUserBlocked.hasConnectedUserBlockedRoom) {
			return (
				<Box
					bg={"headerMenuColor"}
					p="2"
					py="4"
					shadow="2"
					onClick={unblockUser}
					w="full"
					_hover={{
						bg: "lineBreakColor",
					}}
					cursor={"pointer"}
					transition="0.35s ease"
					overflow="hidden"
					whiteSpace={"nowrap"}
				>
					<HStack alignItems={"center"} spacing="1.5">
						<Icon as={BiBlock} boxSize={7} color={"white"} />
						<Box>
							<Text color={"white"} fontSize={"lg"}>
								Unblock this user
							</Text>
						</Box>
					</HStack>
				</Box>
			);
		}

		return (
			<Box
				bg={"headerMenuColor"}
				p="2"
				py="4"
				w="full"
				shadow="2"
				onClick={onOpen}
				_hover={{
					bg: "lineBreakColor",
				}}
				cursor={"pointer"}
				transition="0.35s ease"
				overflow="hidden"
				whiteSpace={"nowrap"}
			>
				<HStack alignItems={"center"} spacing="1.5">
					<Icon as={BiBlock} boxSize={7} color={"importantColor"} />
					<Box>
						<Text color={"importantColor"} fontSize={"lg"}>
							Block this user
						</Text>
					</Box>
				</HStack>
			</Box>
		);
	};

	const isFull = isIpad && isChat && isProfileActive;

	return (
		<>
			<Flex
				background="transparent"
				borderLeft="1px solid"
				borderColor="lineBreakColor"
				transition="0.45s ease"
				w={isFull ? "full" : isProfileActive ? "25%" : 0}
				overflow="hidden"
				h="full"
				flexDir="column"
			>
				<Flex h="66px" alignItems="center" gap="1rem" bg={"headerMenuColor"} px="4" py="3">
					<Icon onClick={() => setIsProfileActive(false)} cursor={"pointer"} as={IoMdClose} boxSize={6} color="white" />
					<Text whiteSpace={"nowrap"} fontSize="xl">
						Profile Informations
					</Text>
				</Flex>

				<VStack flex="1" spacing="4" h="full" overflowY="scroll" whiteSpace={"nowrap"}>
					<Center background="profileColor" w="full" flexDir="column" p="4" gap="4">
						<Avatar
							src={user.avatar_url !== "" ? user.avatar_url : undefined}
							bg={"accentColor"}
							size="2xl"
							name={user.username}
						/>
						<Text fontSize="lg">{user.username}</Text>
					</Center>

					<Flex background="profileColor" w="full" flexDir="column" p="4" gap="4">
						<Text fontSize="lg">About</Text>
						<Text fontSize="sm" color="whiteAlpha.600">
							{user.about !== "" ? user.about : "The user has no bio"}
						</Text>
					</Flex>

					<Flex background="profileColor" w="full" flexDir="column" p="4" gap="4">
						<Text fontSize="lg">Phone number</Text>
						<Text fontSize="sm" color="whiteAlpha.600">
							{user.phone !== "" ? user.phone : "The user has no phone number"}
						</Text>
					</Flex>

					{blockButton()}
				</VStack>
			</Flex>

			<Modal isOpen={isOpen} onClose={onClose}>
				<ModalOverlay />
				<ModalContent bg={"headerMenuColor"}>
					<ModalHeader>Block {user?.username} ?</ModalHeader>
					<ModalCloseButton />
					<ModalBody>Do you want to really block that user ?</ModalBody>

					<ModalFooter>
						<Button variant='ghost' mr={3} onClick={onClose}>
							No
						</Button>
						<Button variant="solid" bg="importantColor" onClick={blockUser}>
							Yes
						</Button>
					</ModalFooter>
				</ModalContent>
			</Modal>
		</>
	);
};

export default ProfileInformations;
