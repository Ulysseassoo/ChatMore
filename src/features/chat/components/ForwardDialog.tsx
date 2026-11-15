import {
	Box,
	Button,
	Checkbox,
	Flex,
	Heading,
	Input,
	Modal,
	ModalBody,
	ModalContent,
	ModalFooter,
	ModalHeader,
	ModalOverlay,
	Text,
	useToast,
} from "@chakra-ui/react";
import { useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { Avatar } from "@/components/Avatar";
import { roomsKey, useRooms } from "@/features/rooms/hooks";
import { getRoomDisplay } from "@/features/rooms/roomDisplay";
import type { ChatMessage } from "@/lib/types";
import { forwardMessage } from "../api";
import { messagesKey } from "../cache";

type Props = { message: ChatMessage | null; onClose: () => void };

export function ForwardDialog({ message, onClose }: Props) {
	const { data: rooms = [] } = useRooms();
	const qc = useQueryClient();
	const toast = useToast();
	const [query, setQuery] = useState("");
	const [selected, setSelected] = useState<number[]>([]);
	const [sending, setSending] = useState(false);

	const targets = useMemo(
		() =>
			rooms
				.filter((r) => !r.i_blocked_peer)
				.map((r) => ({ room: r, display: getRoomDisplay(r) }))
				.filter(({ display }) => display.title.toLowerCase().includes(query.trim().toLowerCase())),
		[rooms, query],
	);

	const close = () => {
		setSelected([]);
		setQuery("");
		onClose();
	};

	const send = async () => {
		if (!message) return;
		setSending(true);
		try {
			await forwardMessage(message.id, selected);
			for (const id of selected) void qc.invalidateQueries({ queryKey: messagesKey(id) });
			void qc.invalidateQueries({ queryKey: roomsKey });
			toast({
				title: `Transféré à ${selected.length} discussion${selected.length > 1 ? "s" : ""}`,
				status: "success",
				duration: 2500,
				position: "bottom",
			});
			close();
		} catch {
			toast({ title: "Le transfert a échoué.", status: "error", position: "bottom" });
		} finally {
			setSending(false);
		}
	};

	return (
		<Modal isOpen={!!message} onClose={close} isCentered scrollBehavior="inside" size="md">
			<ModalOverlay />
			<ModalContent mx={4} maxH="80dvh">
				<ModalHeader pb={2}>
					<Heading as="h2" fontSize="20px" fontWeight={700}>
						Transférer à…
					</Heading>
					<Text mt={1} fontSize="sm" fontWeight={400} color="cm.muted" noOfLines={1}>
						{message?.content || "Photo"}
					</Text>
					<Input
						mt={3}
						h="44px"
						bg="cm.raised"
						placeholder="Rechercher une discussion"
						aria-label="Rechercher une discussion"
						value={query}
						onChange={(e) => setQuery(e.target.value)}
					/>
				</ModalHeader>
				<ModalBody px={3}>
					{targets.map(({ room, display }) => (
						<Flex
							as="label"
							key={room.room_id}
							align="center"
							gap={3}
							minH="56px"
							px={2}
							borderRadius="12px"
							cursor="pointer"
							_hover={{ bg: "cm.raised" }}
						>
							<Avatar
								name={display.title}
								seed={display.seed}
								src={display.avatarUrl}
								size={40}
								square={display.isGroup}
							/>
							<Text flex={1} fontWeight={500} noOfLines={1}>
								{display.title}
							</Text>
							<Checkbox
								size="lg"
								isChecked={selected.includes(room.room_id)}
								onChange={(e) =>
									setSelected((s) => (e.target.checked ? [...s, room.room_id] : s.filter((id) => id !== room.room_id)))
								}
							/>
						</Flex>
					))}
					{targets.length === 0 && (
						<Box px={2} py={4} color="cm.muted">
							Aucune discussion ne correspond.
						</Box>
					)}
				</ModalBody>
				<ModalFooter gap={2.5}>
					<Button onClick={close}>Annuler</Button>
					<Button variant="primary" isDisabled={!selected.length} isLoading={sending} onClick={send}>
						Transférer{selected.length ? ` (${selected.length})` : ""}
					</Button>
				</ModalFooter>
			</ModalContent>
		</Modal>
	);
}
