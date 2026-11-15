import { Box, Button, Flex, IconButton, Image, Menu, MenuButton, MenuDivider, MenuItem, MenuList, Text, Tooltip, useClipboard, useToast } from "@chakra-ui/react";
import { memo, useRef, useState } from "react";
import { IconAlert, IconCheck, IconCopy, IconEdit, IconMore, IconPending, IconRead, IconReply, IconTrash } from "@/components/icons";
import { formatTime } from "@/lib/dates";
import type { ChatMessage } from "@/lib/types";
import { useSignedUrl } from "../hooks";

export const REACTIONS = ["👍", "❤️", "😂", "😮", "😢", "🙏"];

export type BubblePosition = "single" | "first" | "middle" | "last";

export type MessageActions = {
	onReply: (m: ChatMessage) => void;
	onEdit: (m: ChatMessage) => void;
	onDelete: (m: ChatMessage, forEveryone: boolean) => void;
	onReact: (m: ChatMessage, emoji: string | null) => void;
	onRetry: (m: ChatMessage) => void;
};

type Props = {
	message: ChatMessage;
	mine: boolean;
	position: BubblePosition;
	authorName?: string;
	authorColor?: string;
	replied?: { author: string; text: string } | null;
	myId: string;
	actions: MessageActions;
};

/** Coins resserrés entre les messages d'un même groupe, côté auteur. */
function radius(mine: boolean, pos: BubblePosition) {
	const big = "18px";
	const small = "6px";
	const top = pos === "middle" || pos === "last";
	const bottom = pos === "first" || pos === "middle";
	return mine
		? `${big} ${top ? small : big} ${bottom ? small : big} ${big}`
		: `${top ? small : big} ${big} ${big} ${bottom ? small : big}`;
}

function StatusIcon({ status }: { status: ChatMessage["status"] }) {
	if (status === "pending") return <IconPending size={14} aria-label="Envoi en cours" />;
	if (status === "read") return <IconRead size={16} aria-label="Lu" />;
	if (status === "sent") return <IconCheck size={15} aria-label="Envoyé" />;
	return null;
}

function AttachmentImage({ message }: { message: ChatMessage }) {
	const attachment = message.attachments.find((a) => a.kind === "image");
	const { data: url } = useSignedUrl(attachment?.storage_path);
	const src = message.localFile?.url ?? url ?? undefined;
	const width = attachment?.width ?? message.localFile?.width ?? 4;
	const height = attachment?.height ?? message.localFile?.height ?? 3;
	if (!attachment && !message.localFile) return null;
	// La place est réservée avant le chargement : la conversation ne « saute » pas.
	return (
		<Box
			w="min(300px, 62vw)"
			style={{ aspectRatio: `${width} / ${height}` }}
			maxH="360px"
			borderRadius="14px"
			overflow="hidden"
			bg="rgba(0,0,0,0.18)"
		>
			{src && <Image src={src} alt="Photo envoyée" w="full" h="full" objectFit="cover" loading="lazy" />}
		</Box>
	);
}

function MessageBubbleInner({ message, mine, position, authorName, authorColor, replied, myId, actions }: Props) {
	const toast = useToast();
	const { onCopy } = useClipboard(message.content);
	const [menuOpen, setMenuOpen] = useState(false);
	const pressTimer = useRef<number>();
	const deleted = !!message.deleted_at;
	const local = message.status === "pending" || message.status === "failed";
	const myReaction = message.reactions.find((r) => r.user_id === myId)?.emoji ?? null;

	const reactionGroups = Object.entries(
		message.reactions.reduce<Record<string, number>>((acc, r) => ({ ...acc, [r.emoji]: (acc[r.emoji] ?? 0) + 1 }), {}),
	);

	const ink = mine ? "cm.amberInk" : "cm.text";
	const meta = mine ? "cm.amberInkSoft" : "cm.subtle";

	const startPress = () => {
		pressTimer.current = window.setTimeout(() => setMenuOpen(true), 450);
	};
	const cancelPress = () => window.clearTimeout(pressTimer.current);

	return (
		<Flex
			direction="column"
			align={mine ? "flex-end" : "flex-start"}
			mt={position === "single" || position === "first" ? 3 : "2px"}
			role="group"
		>
			<Flex align="center" gap={1} direction={mine ? "row-reverse" : "row"} maxW="min(78%, 560px)">
				<Box
					position="relative"
					px={message.attachments.length || message.localFile ? 1 : 3}
					py={message.attachments.length || message.localFile ? 1 : 2}
					borderRadius={radius(mine, position)}
					bg={mine ? (message.status === "failed" ? "#6B5524" : "cm.amber") : "cm.raised"}
					color={message.status === "failed" ? "cm.text" : ink}
					minW={0}
					onContextMenu={(e) => {
						if (local || deleted) return;
						e.preventDefault();
						setMenuOpen(true);
					}}
					onTouchStart={local || deleted ? undefined : startPress}
					onTouchEnd={cancelPress}
					onTouchMove={cancelPress}
				>
					{authorName && (position === "single" || position === "first") && !mine && (
						<Text fontSize="xs" fontWeight={700} color={authorColor} mb={0.5} px={message.attachments.length ? 2 : 0}>
							{authorName}
						</Text>
					)}
					{replied && !deleted && (
						<Box
							mb={1.5}
							px={2.5}
							py={1.5}
							borderRadius="10px"
							bg={mine ? "rgba(27,22,16,0.12)" : "rgba(255,255,255,0.06)"}
							fontSize="sm"
						>
							<Flex align="center" gap={1.5} fontWeight={600}>
								<IconReply size={13} aria-hidden="true" />
								{replied.author}
							</Flex>
							<Text noOfLines={2} opacity={0.85}>
								{replied.text}
							</Text>
						</Box>
					)}
					{!deleted && <AttachmentImage message={message} />}
					<Box px={message.attachments.length || message.localFile ? 2 : 0} pt={message.attachments.length || message.localFile ? 1 : 0}>
						{deleted ? (
							<Text as="span" fontStyle="italic" opacity={0.8}>
								Ce message a été supprimé
							</Text>
						) : (
							message.content && (
								<Text as="span" whiteSpace="pre-wrap" wordBreak="break-word">
									{message.content}
								</Text>
							)
						)}
						<Flex
							as="span"
							display="inline-flex"
							float="right"
							align="center"
							gap={1}
							ml={2.5}
							mt={1.5}
							fontSize="11px"
							color={message.status === "failed" ? "cm.textSoft" : meta}
							position="relative"
							top="3px"
						>
							{message.edited_at && !deleted && "modifié ·"}
							<time dateTime={message.created_at}>{formatTime(message.created_at)}</time>
							{mine && !deleted && <StatusIcon status={message.status} />}
						</Flex>
					</Box>
				</Box>

				{!local && !deleted && (
					<Menu isOpen={menuOpen} onOpen={() => setMenuOpen(true)} onClose={() => setMenuOpen(false)} placement={mine ? "bottom-end" : "bottom-start"} isLazy>
						<MenuButton
							as={IconButton}
							aria-label="Actions sur le message"
							icon={<IconMore size={18} />}
							variant="ghost"
							size="sm"
							minW="32px"
							h="32px"
							borderRadius="full"
							color="cm.muted"
							// Visible au survol ou au clavier ; sur mobile, l'appui long ouvre le même menu.
							opacity={menuOpen ? 1 : 0}
							_groupHover={{ opacity: 1 }}
							_focusVisible={{ opacity: 1 }}
						/>
						<MenuList>
							<Flex px={2} pb={1} gap={0.5} role="group" aria-label="Réagir">
								{REACTIONS.map((emoji) => (
									<Button
										key={emoji}
										variant="ghost"
										minW="36px"
										h="36px"
										px={0}
										fontSize="20px"
										bg={myReaction === emoji ? "cm.amberTint" : "transparent"}
										aria-label={`Réagir avec ${emoji}`}
										aria-pressed={myReaction === emoji}
										onClick={() => {
											actions.onReact(message, myReaction === emoji ? null : emoji);
											setMenuOpen(false);
										}}
									>
										{emoji}
									</Button>
								))}
							</Flex>
							<MenuDivider borderColor="cm.line" />
							<MenuItem icon={<IconReply size={18} />} onClick={() => actions.onReply(message)}>
								Répondre
							</MenuItem>
							{message.content && (
								<MenuItem
									icon={<IconCopy size={18} />}
									onClick={() => {
										onCopy();
										toast({ title: "Message copié", status: "success", duration: 1500, position: "bottom" });
									}}
								>
									Copier
								</MenuItem>
							)}
							{mine && message.content && !message.attachments.length && (
								<MenuItem icon={<IconEdit size={18} />} onClick={() => actions.onEdit(message)}>
									Modifier
								</MenuItem>
							)}
							<MenuDivider borderColor="cm.line" />
							<MenuItem icon={<IconTrash size={18} />} color="cm.danger" onClick={() => actions.onDelete(message, false)}>
								Supprimer pour moi
							</MenuItem>
							{mine && (
								<MenuItem icon={<IconTrash size={18} />} color="cm.danger" onClick={() => actions.onDelete(message, true)}>
									Supprimer pour tous
								</MenuItem>
							)}
						</MenuList>
					</Menu>
				)}
			</Flex>

			{reactionGroups.length > 0 && (
				<Flex gap={1} mt="-6px" mx={2} zIndex={1}>
					{reactionGroups.map(([emoji, count]) => (
						<Tooltip key={emoji} label={myReaction === emoji ? "Retirer ma réaction" : "Réagir aussi"} openDelay={500}>
							<Button
								size="xs"
								h="24px"
								px={2}
								borderRadius="12px"
								border="2px solid"
								borderColor="cm.chat"
								bg={myReaction === emoji ? "cm.amberTint" : "#3A3430"}
								color="cm.text"
								fontWeight={600}
								aria-label={`${emoji} ${count}`}
								aria-pressed={myReaction === emoji}
								onClick={() => actions.onReact(message, myReaction === emoji ? null : emoji)}
							>
								{emoji} {count > 1 ? count : ""}
							</Button>
						</Tooltip>
					))}
				</Flex>
			)}

			{message.status === "failed" && (
				<Flex align="center" gap={2} mt={1} fontSize="xs" color="cm.danger" role="alert">
					<IconAlert size={15} aria-hidden="true" />
					Non envoyé
					<Button variant="ghost" size="xs" h="28px" color="cm.amberText" textDecoration="underline" onClick={() => actions.onRetry(message)}>
						Réessayer
					</Button>
				</Flex>
			)}
		</Flex>
	);
}

export const MessageBubble = memo(MessageBubbleInner);
