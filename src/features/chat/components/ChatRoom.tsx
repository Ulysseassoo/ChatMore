import { Box, Button, Flex, IconButton, Text, useToast } from "@chakra-ui/react";
import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Link as RouterLink, Navigate, Outlet, useMatch, useParams } from "react-router-dom";
import { MobileBackButton } from "@/app/layouts";
import { Avatar } from "@/components/Avatar";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { IconInfo } from "@/components/icons";
import { useRequiredUserId } from "@/features/auth/session";
import { blocksKey } from "@/features/profile/hooks";
import { unblockUser } from "@/features/profile/api";
import { useRoomPresence } from "@/features/realtime/RealtimeSubscriptions";
import { roomsKey, useRoom, useRoomMembers, useRooms } from "@/features/rooms/hooks";
import { getRoomDisplay } from "@/features/rooms/roomDisplay";
import type { ChatMessage } from "@/lib/types";
import { deleteMessage, editMessage, setReaction } from "../api";
import { messagesKey, patchMessage, removeMessage } from "../cache";
import { useMarkRead, useMessages, useSendMessage } from "../hooks";
import { Composer } from "./Composer";
import { MessageList } from "./MessageList";
import type { MessageActions } from "./MessageBubble";

export function ChatRoom() {
	const roomId = Number(useParams().roomId);
	const { data: rooms, isPending } = useRooms();
	if (isPending) return null;
	if (!Number.isInteger(roomId) || !rooms?.some((r) => r.room_id === roomId)) return <Navigate to="/" replace />;
	return <ChatRoomContent key={roomId} roomId={roomId} />;
}

function ChatRoomContent({ roomId }: { roomId: number }) {
	const myId = useRequiredUserId();
	const qc = useQueryClient();
	const toast = useToast();
	const { data: room } = useRoom(roomId);
	const { data: members = [] } = useRoomMembers(roomId);
	const { data: messages } = useMessages(roomId);
	const presence = useRoomPresence(roomId, myId);
	const panelOpen = useMatch("/chat/:roomId/info") !== null;
	const markRead = useMarkRead(roomId);
	const { send, retry } = useSendMessage(roomId, myId);

	const [replyTo, setReplyTo] = useState<{ message: ChatMessage; author: string } | null>(null);
	const [editing, setEditing] = useState<ChatMessage | null>(null);
	const [toDelete, setToDelete] = useState<ChatMessage | null>(null);

	const nameOf = useCallback((userId: string) => members.find((m) => m.user_id === userId)?.username ?? "Membre", [members]);
	const fail = useCallback(
		(title: string) => toast({ title, status: "error", duration: 4000, position: "bottom", isClosable: true }),
		[toast],
	);

	const newestOther = messages?.pages[0]?.messages.find((m) => m.user_id !== myId)?.created_at;
	useEffect(() => {
		if (!room) return;
		const needsRead = room.unread_count > 0 || (!!newestOther && newestOther > room.my_last_read_at);
		const read = () => {
			if (document.visibilityState === "visible" && needsRead) void markRead();
		};
		read();
		document.addEventListener("visibilitychange", read);
		return () => document.removeEventListener("visibilitychange", read);
	}, [room, newestOther, markRead]);

	const actions: MessageActions = useMemo(
		() => ({
			onReply: (message) => {
				setEditing(null);
				setReplyTo({ message, author: message.user_id === myId ? "vous-même" : nameOf(message.user_id) });
			},
			onEdit: (message) => {
				setReplyTo(null);
				setEditing(message);
			},
			onDelete: (message, forEveryone) => {
				if (forEveryone) return setToDelete(message);
				removeMessage(qc, roomId, { id: message.id });
				deleteMessage(message.id, false).catch(() => {
					fail("Le message n'a pas pu être supprimé.");
					void qc.invalidateQueries({ queryKey: messagesKey(roomId) });
				});
			},
			onReact: (message, emoji) => {
				const had = message.reactions.some((r) => r.user_id === myId);
				const others = message.reactions.filter((r) => r.user_id !== myId);
				const mine = emoji ? [{ message_id: message.id, user_id: myId, emoji, created_at: new Date().toISOString() }] : [];
				patchMessage(qc, roomId, { id: message.id }, { reactions: [...others, ...mine] });
				setReaction(message.id, myId, emoji, had).catch(() => {
					fail("La réaction n'a pas pu être enregistrée.");
					void qc.invalidateQueries({ queryKey: messagesKey(roomId) });
				});
			},
			onRetry: (message) => void retry(message),
		}),
		[qc, roomId, myId, nameOf, fail, retry],
	);

	if (!room) return null;
	const display = getRoomDisplay(room);
	const typingNames = presence.typing.map(nameOf);
	const peerOnline = !display.isGroup && presence.online.length > 0;

	const subtitle = typingNames.length
		? display.isGroup
			? `${typingNames.join(", ")} écri${typingNames.length > 1 ? "vent" : "t"}…`
			: "écrit…"
		: display.isGroup
			? members.map((m) => (m.user_id === myId ? "vous" : m.username)).join(", ")
			: peerOnline
				? "En ligne"
				: null; // jamais « hors ligne » : ce serait trahir un statut masqué

	return (
		<Flex h="full">
			<Flex direction="column" flex={1} minW={0} display={{ base: panelOpen ? "none" : "flex", xl: "flex" }}>
				<Flex as="header" align="center" gap={3} h="68px" px={{ base: 2, lg: 6 }} borderBottom="1px solid" borderColor="cm.line" flexShrink={0} bg={{ base: "cm.surface", lg: "transparent" }}>
					<MobileBackButton />
					<Flex as={RouterLink} to="info" align="center" gap={3} flex={1} minW={0} borderRadius="12px" py={1}>
						<Avatar name={display.title} seed={display.seed} src={display.avatarUrl} size={40} square={display.isGroup} />
						<Box minW={0}>
							<Text fontWeight={600} fontSize="16px" noOfLines={1}>
								{display.title}
							</Text>
							{subtitle && (
								<Flex align="center" gap={1.5} fontSize="13px" color={peerOnline || typingNames.length ? "cm.success" : "cm.muted"} noOfLines={1}>
									{peerOnline && !typingNames.length && <Box as="span" display="inline-block" w="8px" h="8px" borderRadius="full" bg="cm.successDot" mr={1.5} />}
									{subtitle}
								</Flex>
							)}
						</Box>
					</Flex>
					<IconButton as={RouterLink} to="info" aria-label={display.isGroup ? "Infos du groupe" : "Profil du contact"} icon={<IconInfo size={20} />} variant="ghost" />
				</Flex>

				<MessageList
					roomId={roomId}
					myId={myId}
					isGroup={display.isGroup}
					members={members}
					lastReadAt={room.my_last_read_at}
					actions={actions}
					typingNames={typingNames}
				/>

				{room.i_blocked_peer ? (
					<Flex direction="column" align="center" gap={2} py={4} px={4} borderTop="1px solid" borderColor="cm.line" textAlign="center">
						<Text color="cm.muted" fontSize="sm">
							Tu as bloqué {display.title}. Tu ne reçois plus ses messages.
						</Text>
						<Button
							size="md"
							onClick={async () => {
								try {
									await unblockUser(myId, display.peerId!);
									void qc.invalidateQueries({ queryKey: roomsKey });
									void qc.invalidateQueries({ queryKey: blocksKey });
								} catch {
									fail("Le déblocage a échoué.");
								}
							}}
						>
							Débloquer
						</Button>
					</Flex>
				) : (
					<Composer
						roomId={roomId}
						myId={myId}
						replyTo={replyTo}
						editing={editing}
						onCancelReply={() => setReplyTo(null)}
						onCancelEdit={() => setEditing(null)}
						onError={fail}
						onSend={(text, file) => {
							send(text, replyTo?.message.id ?? null, file);
							setReplyTo(null);
						}}
						onSaveEdit={(message, text) => {
							patchMessage(qc, roomId, { id: message.id }, { content: text, edited_at: new Date().toISOString() });
							editMessage(message.id, text).catch(() => {
								fail("La modification n'a pas pu être enregistrée.");
								void qc.invalidateQueries({ queryKey: messagesKey(roomId) });
							});
						}}
					/>
				)}
			</Flex>

			{panelOpen && (
				<Box w={{ base: "full", xl: "380px" }} flexShrink={0} borderLeft={{ xl: "1px solid" }} borderColor="cm.line" bg="cm.surface" overflowY="auto">
					<Outlet />
				</Box>
			)}

			<ConfirmDialog
				isOpen={!!toDelete}
				title="Supprimer pour tout le monde ?"
				description="Le message sera remplacé par « Ce message a été supprimé » chez tous les participants."
				confirmLabel="Supprimer"
				onClose={() => setToDelete(null)}
				onConfirm={async () => {
					const message = toDelete!;
					setToDelete(null);
					patchMessage(qc, roomId, { id: message.id }, { deleted_at: new Date().toISOString(), content: "", attachments: [], reactions: [] });
					try {
						await deleteMessage(message.id, true);
					} catch {
						fail("Le message n'a pas pu être supprimé.");
						void qc.invalidateQueries({ queryKey: messagesKey(roomId) });
					}
				}}
			/>
		</Flex>
	);
}
