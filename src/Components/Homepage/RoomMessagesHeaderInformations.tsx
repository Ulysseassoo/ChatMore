import {
	useDisclosure,
	HStack,
	Center,
	Icon,
	Button,
	Modal,
	ModalBody,
	ModalCloseButton,
	ModalContent,
	ModalFooter,
	ModalHeader,
	ModalOverlay,
} from "@chakra-ui/react";
import React from "react";
import { BsThreeDotsVertical } from "react-icons/bs";

const RoomMessagesHeaderInformations = () => {
	const { isOpen, onOpen, onClose } = useDisclosure();
	return (
		<>
			<HStack spacing="4" alignItems="center">
				<Center
					p="2"
					borderRadius="lg"
					_hover={{
						background: "whiteAlpha.100",
					}}
					cursor="pointer"
				>
					<Icon onClick={onOpen} as={BsThreeDotsVertical} color={"white"} />
				</Center>
			</HStack>

			<Modal isOpen={isOpen} onClose={onClose}>
				<ModalOverlay />
				<ModalContent>
					<ModalHeader>Modal Title</ModalHeader>
					<ModalCloseButton />
					<ModalBody>zezedoimjzedijzedzemdi</ModalBody>

					<ModalFooter>
						<Button colorScheme='blue' mr={3} onClick={onClose}>
							Close
						</Button>
						<Button variant='ghost'>Secondary Action</Button>
					</ModalFooter>
				</ModalContent>
			</Modal>
		</>
	);
};

export default RoomMessagesHeaderInformations;
