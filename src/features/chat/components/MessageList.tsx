import { Box, Button, Flex, Spinner, Text } from "@chakra-ui/react";
import { Fragment, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { IconArrowDown } from "@/components/icons";
import { useSearchParams } from "react-router-dom";
import { dayKey, formatDayLabel } from "@/lib/dates";
import type { ChatMessage, RoomMember } from "@/lib/types";
import { useMessages } from "../hooks";
import { MessageBubble, type BubblePosition, type MessageActions } from "./MessageBubble";

const GROUP_GAP_MS = 5 * 60_000;
const AUTHOR_COLORS = ["#F0A27A", "#8FC9B8", "#9DB6E8", "#C9A6E0", "#C2CF8A", "#E8B26A", "#E79AB8"];

type Props = {
	roomId: number;
	myId: string;
	isGroup: boolean;
	members: RoomMember[];
	lastReadAt: string | null;
	actions: MessageActions;
	typingNames: string[];
};

// column-reverse : on démarre en bas et l'historique chargé au-dessus ne déplace pas la lecture.
export function MessageList({ roomId, myId, isGroup, members, lastReadAt, actions, typingNames }: Props) {
	const { data, isPending, isError, refetch, fetchNextPage, hasNextPage, isFetchingNextPage } = useMessages(roomId);
	const scrollRef = useRef<HTMLDivElement>(null);
	const topRef = useRef<HTMLDivElement>(null);
	const [atBottom, setAtBottom] = useState(true);
	const [newCount, setNewCount] = useState(0);
	const [highlighted, setHighlighted] = useState<number | null>(null);
	const [params, setParams] = useSearchParams();
	const target = Number(params.get("m")) || null;

	const messages = useMemo(() => (data ? data.pages.flatMap((p) => p.messages).reverse() : []), [data]);
	const byId = useMemo(() => new Map(messages.map((m) => [m.id, m])), [messages]);
	const nameOf = useMemo(() => new Map(members.map((m) => [m.user_id, m.username])), [members]);
	const colorOf = (userId: string) =>
		AUTHOR_COLORS[[...userId].reduce((a, c) => a + c.charCodeAt(0), 0) % AUTHOR_COLORS.length];

	// Figé à l'ouverture : ce qui arrive pendant qu'on regarde n'est pas « non lu ».
	const [firstUnreadId, setFirstUnreadId] = useState<number | null | undefined>(undefined);
	useEffect(() => {
		if (firstUnreadId !== undefined || !data) return;
		setFirstUnreadId(messages.find((m) => m.user_id !== myId && !!lastReadAt && m.created_at > lastReadAt)?.id ?? null);
	}, [data, messages, myId, lastReadAt, firstUnreadId]);

	useEffect(() => {
		const el = topRef.current;
		if (!el) return;
		const observer = new IntersectionObserver(
			([entry]) => {
				if (entry?.isIntersecting && hasNextPage && !isFetchingNextPage) void fetchNextPage();
			},
			{ root: scrollRef.current, rootMargin: "400px 0px 0px 0px" },
		);
		observer.observe(el);
		return () => observer.disconnect();
	}, [hasNextPage, isFetchingNextPage, fetchNextPage]);

	// Saut vers un message (?m=) : on charge l'historique jusqu'à lui.
	useEffect(() => {
		if (!target || !data) return;
		if (!messages.some((m) => m.id === target)) {
			if (hasNextPage) {
				if (!isFetchingNextPage) void fetchNextPage();
				return;
			}
		} else {
			document.getElementById(`message-${target}`)?.scrollIntoView({ block: "center" });
			setHighlighted(target);
		}
		setParams(
			(p) => {
				p.delete("m");
				return p;
			},
			{ replace: true },
		);
	}, [target, data, messages, hasNextPage, isFetchingNextPage, fetchNextPage, setParams]);

	useEffect(() => {
		if (highlighted === null) return;
		const timer = setTimeout(() => setHighlighted(null), 2500);
		return () => clearTimeout(timer);
	}, [highlighted]);

	const newest = messages.at(-1);
	const lastSeenNewest = useRef<number | undefined>(undefined);
	useLayoutEffect(() => {
		if (!newest) return;
		const previous = lastSeenNewest.current;
		lastSeenNewest.current = newest.id;
		if (previous === undefined || previous === newest.id) return;
		const el = scrollRef.current;
		if (newest.user_id === myId || atBottom) {
			el?.scrollTo({ top: 0 }); // en column-reverse, 0 = tout en bas
			setNewCount(0);
		} else {
			setNewCount((c) => c + 1);
		}
	}, [newest, myId, atBottom]);

	const onScroll = () => {
		const el = scrollRef.current;
		if (!el) return;
		const bottom = Math.abs(el.scrollTop) < 80;
		setAtBottom(bottom);
		if (bottom) setNewCount(0);
	};

	if (isPending)
		return (
			<Flex flex={1} align="center" justify="center">
				<Spinner color="cm.amber" />
			</Flex>
		);
	if (isError)
		return (
			<Flex flex={1} direction="column" align="center" justify="center" gap={3}>
				<Text color="cm.muted">Impossible de charger les messages.</Text>
				<Button onClick={() => refetch()}>Réessayer</Button>
			</Flex>
		);

	const position = (i: number): BubblePosition => {
		const m = messages[i]!;
		const prev = messages[i - 1];
		const next = messages[i + 1];
		const joinsPrev =
			!!prev &&
			prev.user_id === m.user_id &&
			dayKey(prev.created_at) === dayKey(m.created_at) &&
			Date.parse(m.created_at) - Date.parse(prev.created_at) < GROUP_GAP_MS &&
			prev.id !== firstUnreadId &&
			m.id !== firstUnreadId;
		const joinsNext =
			!!next &&
			next.user_id === m.user_id &&
			dayKey(next.created_at) === dayKey(m.created_at) &&
			Date.parse(next.created_at) - Date.parse(m.created_at) < GROUP_GAP_MS &&
			next.id !== firstUnreadId;
		if (joinsPrev && joinsNext) return "middle";
		if (joinsPrev) return "last";
		if (joinsNext) return "first";
		return "single";
	};

	const replyInfo = (m: ChatMessage) => {
		if (!m.reply_to_id) return null;
		const target = byId.get(m.reply_to_id);
		if (!target) return { author: "Message", text: "Message plus ancien" };
		return {
			author: target.user_id === myId ? "Vous" : (nameOf.get(target.user_id) ?? "Membre"),
			text: target.deleted_at ? "Message supprimé" : target.content || "Photo",
		};
	};

	return (
		<Box position="relative" flex={1} minH={0}>
			<Flex
				ref={scrollRef}
				onScroll={onScroll}
				direction="column-reverse"
				h="full"
				overflowY="auto"
				px={{ base: 3.5, lg: 6 }}
				pt={4}
				pb={3}
				role="log"
				aria-label="Messages"
				aria-live="polite"
			>
				<Box maxW="760px" w="full" mx="auto">
					<Box ref={topRef} h="1px" />
					{isFetchingNextPage && (
						<Flex justify="center" py={3}>
							<Spinner size="sm" color="cm.amber" />
						</Flex>
					)}
					{!hasNextPage && messages.length > 0 && (
						<Text textAlign="center" fontSize="xs" color="cm.subtle" py={3}>
							Début de la conversation
						</Text>
					)}
					{messages.length === 0 && (
						<Text textAlign="center" color="cm.muted" py={10}>
							Aucun message pour l'instant. Dis bonjour !
						</Text>
					)}
					{messages.map((m, i) => {
						const prev = messages[i - 1];
						const newDay = !prev || dayKey(prev.created_at) !== dayKey(m.created_at);
						const mine = m.user_id === myId;
						return (
							<Fragment key={m.client_id ?? m.id}>
								{newDay && (
									<Flex justify="center" my={4}>
										<Text
											px={3}
											py={1}
											borderRadius="10px"
											bg="cm.raised"
											fontSize="xs"
											fontWeight={500}
											color="cm.textSoft"
										>
											{formatDayLabel(m.created_at)}
										</Text>
									</Flex>
								)}
								{m.id === firstUnreadId && (
									<Flex
										role="separator"
										align="center"
										gap={3}
										my={4}
										color="cm.amberText"
										fontSize="xs"
										fontWeight={600}
									>
										<Box flex={1} h="1px" bg="#5A4A26" />
										Nouveaux messages
										<Box flex={1} h="1px" bg="#5A4A26" />
									</Flex>
								)}
								<MessageBubble
									message={m}
									mine={mine}
									myId={myId}
									position={position(i)}
									highlighted={highlighted === m.id}
									authorName={isGroup && !mine ? (nameOf.get(m.user_id) ?? "Ancien membre") : undefined}
									authorColor={colorOf(m.user_id)}
									replied={replyInfo(m)}
									actions={actions}
								/>
							</Fragment>
						);
					})}
					{typingNames.length > 0 && (
						<Flex
							role="status"
							align="center"
							gap={2}
							mt={3}
							px={3.5}
							py={3}
							w="fit-content"
							borderRadius="18px 18px 18px 6px"
							bg="cm.raised"
							fontSize="sm"
							color="cm.muted"
						>
							<Flex gap={1} aria-hidden="true">
								{["#A39A90", "#8A8178", "#6E665E"].map((c) => (
									<Box key={c} w="7px" h="7px" borderRadius="full" bg={c} />
								))}
							</Flex>
							{isGroup ? (
								`${typingNames.join(" et ")} ${typingNames.length > 1 ? "écrivent" : "écrit"}…`
							) : (
								<Box as="span" srOnly>
									écrit…
								</Box>
							)}
						</Flex>
					)}
				</Box>
			</Flex>

			{newCount > 0 && (
				<Button
					position="absolute"
					bottom={4}
					left="50%"
					transform="translateX(-50%)"
					variant="primary"
					size="sm"
					h="40px"
					borderRadius="20px"
					rightIcon={<IconArrowDown size={18} />}
					boxShadow="0 6px 18px rgba(0,0,0,0.45)"
					onClick={() => scrollRef.current?.scrollTo({ top: 0, behavior: "smooth" })}
				>
					{newCount} nouveau{newCount > 1 ? "x" : ""} message{newCount > 1 ? "s" : ""}
				</Button>
			)}
		</Box>
	);
}
