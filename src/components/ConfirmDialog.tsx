import { Box, Button, Flex, Heading, Modal, ModalBody, ModalContent, ModalOverlay, Text } from "@chakra-ui/react";
import { useRef } from "react";

type Props = {
	isOpen: boolean;
	title: string;
	description?: React.ReactNode;
	confirmLabel: string;
	icon?: React.ReactNode;
	onConfirm: () => void;
	onClose: () => void;
};

export function ConfirmDialog({ isOpen, title, description, confirmLabel, icon, onConfirm, onClose }: Props) {
	const cancelRef = useRef<HTMLButtonElement>(null);
	return (
		<Modal isOpen={isOpen} onClose={onClose} initialFocusRef={cancelRef} isCentered size="md">
			<ModalOverlay />
			<ModalContent mx={4} aria-labelledby="confirm-title">
				<ModalBody p={7}>
					{icon && (
						<Flex
							w="48px"
							h="48px"
							borderRadius="14px"
							bg="cm.dangerTint"
							color="cm.danger"
							align="center"
							justify="center"
							mb={4}
						>
							{icon}
						</Flex>
					)}
					<Heading id="confirm-title" as="h2" fontSize="20px" fontWeight={700} mb={2.5}>
						{title}
					</Heading>
					{description && (
						<Box color="#C9C0B6" lineHeight={1.7} mb={6}>
							{typeof description === "string" ? <Text>{description}</Text> : description}
						</Box>
					)}
					<Flex gap={2.5} justify="flex-end" wrap="wrap">
						<Button ref={cancelRef} onClick={onClose}>
							Annuler
						</Button>
						<Button variant="danger" onClick={onConfirm}>
							{confirmLabel}
						</Button>
					</Flex>
				</ModalBody>
			</ModalContent>
		</Modal>
	);
}
