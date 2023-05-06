import React, { useEffect, useMemo, useRef } from "react";
import { Message } from "../../Interface/Types";
import useAuthStore from "../../Store/authStore";
import useRoomStore from "../../Store/roomStore";
import { supabase } from "../../supabaseClient";
import {
	Box,
	Button,
	HStack,
	Icon,
	Image,
	Menu,
	MenuButton,
	MenuItem,
	MenuList,
	Text,
	VStack,
	useDisclosure,
	useToast,
} from "@chakra-ui/react";
import { deleteImageById, deleteMessageById } from "../../Services/APIs";
import { BsTrashFill } from "react-icons/bs";
import { ChakraBox } from "../../Framer";
import { AnimatePresence } from "framer-motion";

interface Props {
	item: Message;
}

const animationMessage = {
	visible: {
		y: 0,
		opacity: 100,
		transition: {
			when: "beforeChildren",
			staggerChildren: 0.3,
		},
	},
	hidden: {
		y: 50,
		opacity: 0,
		transition: {
			when: "afterChildren",
		},
	},
};

export const dateFormatted = (created_at: string) => {
	const splittedDate = new Date(created_at)
		.toLocaleTimeString([], {
			hourCycle: "h23",
			hour: "2-digit",
			minute: "2-digit",
			second: "numeric",
		})
		.split(":");

	return `${splittedDate[0]}:${splittedDate[1]}`;
};

const ChatMessage = ({ item }: Props) => {
	const timeoutRef = useRef<NodeJS.Timeout | null>(null);
	const session = useAuthStore((state) => state.session);
	const [imageSrc, setImageSrc] = React.useState<string | null>("");
	const removeMessageFromRoom = useRoomStore((state) => state.removeMessageFromRoom);
	const { isOpen, onOpen } = useDisclosure();
	const channels = supabase.getChannels();
	const getChannelRoom = channels.find((chan) => chan.topic.split(":")[1] === `room${item.room.toString()}`);
	const toast = useToast();

	const isFromConnectedUser = useMemo(() => {
		return item.user === session?.user.id;
	}, []);

	const getImageSource = async (source: string | null) => {
		if (source === null) throw Error;
		try {
			const { data, error } = await supabase.storage.from("users-images").download(source);
			if (error) {
				throw error;
			}
			if (data !== null) {
				setImageSrc(URL.createObjectURL(data));
			}
		} catch (error: any) {
			toast({
				title: "Error downloading image:",
				description: error.message,
				status: "error",
				position: "top-right",
				duration: 3000,
				isClosable: true,
			});
		}
	};

	const deleteMessage = async (id: number) => {
		try {
			if (item.images !== undefined && item.images.length > 0 && item.images[0].url !== null) {
				// Delete image + bucket
				const { error } = await supabase.storage.from("users-images").remove([item.images[0].url]);
				if (error) throw error;
				await deleteImageById(item.images[0].id);
			}
			await deleteMessageById(id);
			removeMessageFromRoom(item);
			if (getChannelRoom !== undefined) {
				getChannelRoom.send({
					type: "broadcast",

					event: "deleteMessage",

					payload: { message: item },
				});
			}
			toast({
				title: "Success",
				description: "Message deleted !",
				status: "success",
				position: "top-right",
				duration: 1500,
				isClosable: true,
			});
			// onClose();
		} catch (error: any) {
			toast({
				title: "Error when deleting, please retry",
				description: error.error_description || error.message,
				status: "error",
				position: "top-right",
				duration: 1500,
				isClosable: true,
			});
		}
	};

	const showMessageContent = () => {
		if (item?.images !== undefined && item.images.length > 0) {
			return (
				<HStack
					height="250"
					width="250"
					position="relative"
					spacing="4"
					alignItems="flex-end"
					justifyContent={"space-between"}
					borderRadius="md"
					flexDir="row"
					flexWrap="wrap"
				>
					{imageSrc !== "" && imageSrc !== null && (
						<Image src={imageSrc} height="250" width="250" borderRadius="md" alt="image" />
					)}
					<Text color="white">{item.content}</Text>
					{item.created_at && (
						<Text color={"white"} fontSize="2xs" position="absolute" bottom="0" right="1">
							{dateFormatted(item.created_at)}
						</Text>
					)}
				</HStack>
			);
		}

		return (
			<VStack position="relative" spacing="1" alignItems="flex-end" justifyContent={"space-between"}>
				<Text color="white" w="full">
					{item.content}
				</Text>
				{item.created_at && (
					<Text color={"white"} fontSize="2xs">
						{dateFormatted(item.created_at)}
					</Text>
				)}
			</VStack>
		);
	};

	const handleMouseDown = () => {
		if (timeoutRef.current !== undefined) {
			timeoutRef.current = setTimeout(() => {
				onOpen();
			}, 500);
		}
	};

	const handleMouseUp = () => {
		if (timeoutRef.current !== null) {
			clearTimeout(timeoutRef.current);
		}
	};

	useEffect(() => {
		if (item.images !== undefined && item.images?.length > 0) {
			getImageSource(item.images[0].url);
		}
	}, [item.images]);

	return (
		<AnimatePresence>
			<ChakraBox
				animate="visible"
				initial="hidden"
				key={item.id}
				// @ts-ignore
				transition={{ ease: "easeOut", duration: 0.3 }}
				variants={animationMessage}
				exit="hidden"
				alignSelf={isFromConnectedUser ? "flex-end" : "flex-start"}
				maxW="80%"
			>
				<Box
					p="2"
					bg={isFromConnectedUser ? "accentColor" : "headerMenuColor"}
					borderRadius="md"
					mb="2.5"
					shadow="6"
					w="full"
					as={Box}
					onMouseDown={handleMouseDown}
					onMouseUp={handleMouseUp}
					onTouchStart={handleMouseDown}
					onTouchEnd={handleMouseUp}
					_hover={{
						bg: isFromConnectedUser ? "accentColorHover" : "headerMenuColor",
					}}
				>
					{showMessageContent()}
				</Box>
				{/* {isFromConnectedUser && isOpen ? (
					<MenuList background="primaryColor" borderColor="lineBreakColor">
						<MenuItem
							_hover={{
								bg: "headerMenuColor",
							}}
							p="2"
							background="primaryColor"
							onClick={() => deleteMessage(item.id)}
						>
							<Icon as={BsTrashFill} size="6" color="importantColor" />
							Delete
						</MenuItem>
					</MenuList>
				) : null} */}
			</ChakraBox>
		</AnimatePresence>
	);
};

export default ChatMessage;
