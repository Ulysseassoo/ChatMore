import { Box, Flex, IconButton, Text, Textarea, VisuallyHidden } from "@chakra-ui/react";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { IconAttach, IconClose, IconEdit, IconReply, IconSend } from "@/components/icons";
import { setTyping } from "@/features/realtime/RealtimeSubscriptions";
import { useDebouncedValue } from "@/lib/useDebouncedValue";
import type { ChatMessage } from "@/lib/types";
import { useDrafts } from "../drafts";

const ACCEPTED = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const finePointer = () => window.matchMedia("(pointer: fine)").matches;

type Props = {
	roomId: number;
	myId: string;
	replyTo: { message: ChatMessage; author: string } | null;
	editing: ChatMessage | null;
	onCancelReply: () => void;
	onCancelEdit: () => void;
	onSend: (text: string, file?: { file: File; url: string; width?: number; height?: number }) => void;
	onSaveEdit: (message: ChatMessage, text: string) => void;
	onError: (message: string) => void;
};

/**
 * Zone de saisie : s'agrandit avec le texte, garde un brouillon par conversation,
 * Entrée pour envoyer sur ordinateur (Maj + Entrée pour aller à la ligne).
 */
export function Composer({ roomId, myId, replyTo, editing, onCancelReply, onCancelEdit, onSend, onSaveEdit, onError }: Props) {
	const draft = useDrafts((s) => s.drafts[roomId] ?? "");
	const setDraft = useDrafts((s) => s.setDraft);
	const [text, setText] = useState(draft);
	const textareaRef = useRef<HTMLTextAreaElement>(null);
	const fileRef = useRef<HTMLInputElement>(null);

	// Le composant est réutilisé d'une conversation à l'autre : on recharge le bon brouillon.
	useEffect(() => {
		setText(useDrafts.getState().drafts[roomId] ?? "");
	}, [roomId]);

	useEffect(() => {
		if (editing) {
			setText(editing.content);
			textareaRef.current?.focus();
		}
	}, [editing]);

	useEffect(() => {
		if (replyTo) textareaRef.current?.focus();
	}, [replyTo]);

	// « écrit… » : un signal toutes les 3 s au plus pendant la frappe, un signal d'arrêt
	// après 3 s sans frappe (ou à l'envoi).
	const settled = useDebouncedValue(text, 3000);
	const typing = text.trim() !== "" && text !== settled && !editing;
	useEffect(() => {
		if (!typing) setTyping(roomId, myId, false);
	}, [roomId, myId, typing]);
	useEffect(() => () => setTyping(roomId, myId, false), [roomId, myId]);

	// Hauteur automatique, jusqu'à six lignes environ.
	useLayoutEffect(() => {
		const el = textareaRef.current;
		if (!el) return;
		el.style.height = "auto";
		el.style.height = `${Math.min(el.scrollHeight, 148)}px`;
	}, [text]);

	const update = (value: string) => {
		setText(value);
		if (editing) return;
		setDraft(roomId, value);
		if (value.trim()) setTyping(roomId, myId, true);
	};

	const submit = () => {
		const value = text.trim();
		if (!value) return;
		if (editing) {
			if (value !== editing.content) onSaveEdit(editing, value);
			onCancelEdit();
			setText(useDrafts.getState().drafts[roomId] ?? ""); // on retrouve son brouillon
			return;
		} else {
			onSend(value);
			setDraft(roomId, "");
			setTyping(roomId, myId, false);
		}
		setText("");
		textareaRef.current?.focus();
	};

	const pickFile = async (file: File | undefined) => {
		if (!file) return;
		if (!ACCEPTED.includes(file.type)) return onError("Formats acceptés : JPEG, PNG, WebP ou GIF.");
		if (file.size > 20 * 1024 * 1024) return onError("Image trop lourde (20 Mo maximum).");
		const url = URL.createObjectURL(file);
		const size = await new Promise<{ width?: number; height?: number }>((resolve) => {
			const img = new Image();
			img.onload = () => resolve({ width: img.naturalWidth, height: img.naturalHeight });
			img.onerror = () => resolve({});
			img.src = url;
		});
		onSend(text.trim(), { file, url, ...size });
		setText("");
		setDraft(roomId, "");
	};

	const banner = editing
		? {
				icon: <IconEdit size={15} />,
				label: "Modification du message",
				text: editing.content,
				cancel: () => {
					onCancelEdit();
					setText(draft);
				},
			}
		: replyTo
			? { icon: <IconReply size={15} />, label: `Réponse à ${replyTo.author}`, text: replyTo.message.content || "Photo", cancel: onCancelReply }
			: null;

	return (
		<Box
			as="form"
			px={{ base: 2.5, lg: 6 }}
			pt={3}
			pb={{ base: "max(12px, env(safe-area-inset-bottom))", lg: 4 }}
			borderTop="1px solid"
			borderColor="cm.line"
			bg={{ base: "cm.surface", lg: "cm.chat" }}
			onSubmit={(e) => {
				e.preventDefault();
				submit();
			}}
		>
			<Box maxW="760px" mx="auto">
				{banner && (
					<Flex align="center" gap={2} mb={2} px={3} py={2} borderRadius="12px" bg="cm.raised" fontSize="sm">
						<Box color="cm.amberText">{banner.icon}</Box>
						<Box flex={1} minW={0}>
							<Text fontWeight={600}>{banner.label}</Text>
							<Text color="cm.muted" noOfLines={1}>
								{banner.text}
							</Text>
						</Box>
						<IconButton aria-label="Annuler" icon={<IconClose size={16} />} variant="ghost" size="sm" onClick={banner.cancel} />
					</Flex>
				)}
				<Flex align="flex-end" gap={2}>
					<IconButton
						aria-label="Joindre une image"
						icon={<IconAttach size={22} />}
						variant="ghost"
						borderRadius="full"
						w="44px"
						h="44px"
						isDisabled={!!editing}
						onClick={() => fileRef.current?.click()}
					/>
					<input
						ref={fileRef}
						type="file"
						hidden
						accept={ACCEPTED.join(",")}
						onChange={(e) => {
							void pickFile(e.target.files?.[0]);
							e.target.value = "";
						}}
					/>
					<Box flex={1} minW={0} bg="cm.raised" borderRadius="22px" px={4} py="11px">
						<VisuallyHidden as="label" htmlFor={`composer-${roomId}`}>
							Message
						</VisuallyHidden>
						<Textarea
							id={`composer-${roomId}`}
							ref={textareaRef}
							rows={1}
							variant="unstyled"
							resize="none"
							minH="22px"
							lineHeight="22px"
							p={0}
							placeholder="Écrire un message"
							_placeholder={{ color: "#9A9189" }}
							value={text}
							onChange={(e) => update(e.target.value)}
							onKeyDown={(e) => {
								if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing && finePointer()) {
									e.preventDefault();
									submit();
								}
								if (e.key === "Escape" && banner) banner.cancel();
							}}
							aria-describedby={`composer-hint-${roomId}`}
						/>
					</Box>
					<IconButton
						type="submit"
						aria-label={editing ? "Enregistrer la modification" : "Envoyer"}
						icon={<IconSend size={20} />}
						variant="primary"
						borderRadius="full"
						w="44px"
						h="44px"
						isDisabled={!text.trim()}
					/>
				</Flex>
				<Text id={`composer-hint-${roomId}`} mt={1.5} pl="52px" fontSize="xs" color="#9A9189" display={{ base: "none", lg: "block" }}>
					Entrée pour envoyer · Maj + Entrée pour aller à la ligne
				</Text>
			</Box>
		</Box>
	);
}
