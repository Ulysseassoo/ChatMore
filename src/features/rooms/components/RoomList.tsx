import {
	Box,
	Button,
	Flex,
	Heading,
	IconButton,
	Input,
	InputGroup,
	InputLeftElement,
	Skeleton,
	Text,
	VisuallyHidden,
} from "@chakra-ui/react";
import { useMemo, useState } from "react";
import { Link as RouterLink, NavLink } from "react-router-dom";
import { Avatar } from "@/components/Avatar";
import { InlineAlert } from "@/components/InlineAlert";
import { IconCompose, IconMuted, IconRead, IconSearch } from "@/components/icons";
import logo from "@/assets/Logo.png";
import { useRequiredUserId } from "@/features/auth/session";
import { useDrafts } from "@/features/chat/drafts";
import { useMyProfile } from "@/features/profile/hooks";
import { useRoomPresence } from "@/features/realtime/RealtimeSubscriptions";
import { formatListTime } from "@/lib/dates";
import type { Room } from "@/lib/types";
import { useRooms } from "../hooks";
import { getRoomDisplay } from "../roomDisplay";

type Filter = "all" | "unread" | "groups";

function Preview({ room, myId }: { room: Room; myId: string }) {
	const typing = useRoomPresence(room.room_id, myId).typing.length > 0;
	const draft = useDrafts((s) => s.drafts[room.room_id]);
	const last = room.last_message;

	if (typing)
		return (
			<Text as="span" color="cm.amberText" fontWeight={500}>
				écrit…
			</Text>
		);
	if (draft)
		return (
			<>
				<Text as="span" color="cm.amberText" fontWeight={500}>
					Brouillon :{" "}
				</Text>
				{draft}
			</>
		);
	if (!last) return <>Nouvelle discussion</>;
	const mine = last.user_id === myId;
	const text = last.deleted_at ? "Message supprimé" : last.content || (last.has_attachment ? "Photo" : "");
	return (
		<>
			{mine && (
				<IconRead size={15} aria-hidden="true" style={{ display: "inline", verticalAlign: "-2px", marginRight: 3 }} />
			)}
			{mine ? "Vous : " : ""}
			{text}
		</>
	);
}

function RoomRow({ room, myId }: { room: Room; myId: string }) {
	const display = getRoomDisplay(room);
	const unread = room.unread_count;
	const time = room.last_message?.created_at ?? room.last_activity_at;

	return (
		<NavLink to={`/chat/${room.room_id}`} style={{ display: "block", borderRadius: 14 }}>
			{({ isActive }) => (
				<Flex
					gap={3}
					align="center"
					minH="72px"
					px={3}
					py={2.5}
					borderRadius="14px"
					bg={isActive ? "cm.raised" : "transparent"}
					_hover={{ bg: isActive ? "cm.raised" : "rgba(43,40,38,0.55)" }}
				>
					<Avatar name={display.title} seed={display.seed} src={display.avatarUrl} size={50} square={display.isGroup} />
					<Box flex={1} minW={0}>
						<Flex justify="space-between" gap={2} align="baseline">
							<Text fontWeight={unread ? 700 : 600} noOfLines={1}>
								{display.title}
							</Text>
							<Text fontSize="xs" color={unread ? "cm.amberText" : "cm.subtle"} flexShrink={0}>
								{formatListTime(time)}
							</Text>
						</Flex>
						<Flex justify="space-between" gap={2} align="center" mt={0.5}>
							<Text fontSize="sm" color="cm.muted" noOfLines={1}>
								<Preview room={room} myId={myId} />
							</Text>
							<Flex gap={1.5} align="center" flexShrink={0}>
								{room.muted && <IconMuted size={15} color="#9A9189" aria-label="Notifications coupées" />}
								{unread > 0 && (
									<Flex
										minW="22px"
										h="22px"
										px="7px"
										borderRadius="11px"
										bg="cm.amber"
										color="cm.amberInk"
										fontSize="xs"
										fontWeight={700}
										align="center"
										justify="center"
									>
										{unread}
										<VisuallyHidden> messages non lus</VisuallyHidden>
									</Flex>
								)}
							</Flex>
						</Flex>
					</Box>
				</Flex>
			)}
		</NavLink>
	);
}

export function RoomList() {
	const myId = useRequiredUserId();
	const { data: rooms, isPending, isError, refetch } = useRooms();
	const { data: me } = useMyProfile();
	const [filter, setFilter] = useState<Filter>("all");
	const [search, setSearch] = useState("");

	const unreadRooms = rooms?.filter((r) => r.unread_count > 0).length ?? 0;
	const visible = useMemo(() => {
		const q = search.trim().toLowerCase();
		return (rooms ?? []).filter(
			(r) =>
				(filter === "all" || (filter === "unread" ? r.unread_count > 0 : r.type === "group")) &&
				(!q || getRoomDisplay(r).title.toLowerCase().includes(q)),
		);
	}, [rooms, filter, search]);

	const chips: { id: Filter; label: string }[] = [
		{ id: "all", label: "Toutes" },
		{ id: "unread", label: unreadRooms ? `Non lues · ${unreadRooms}` : "Non lues" },
		{ id: "groups", label: "Groupes" },
	];

	return (
		<Flex direction="column" h="full" minH={0} position="relative">
			<Box px={{ base: 4, lg: 5 }} pt={{ base: "max(16px, env(safe-area-inset-top))", lg: 5 }} pb={3}>
				<Flex align="center" gap={2.5}>
					<Box as="img" src={logo} alt="" w="32px" display={{ base: "block", lg: "none" }} />
					<Heading as="h1" flex={1} fontSize={{ base: "26px", lg: "22px" }} fontWeight={{ base: 800, lg: 700 }}>
						Discussions
					</Heading>
					<IconButton
						as={RouterLink}
						to="/new"
						aria-label="Nouvelle discussion"
						icon={<IconCompose size={20} />}
						variant="ghost"
						bg="cm.raised"
						display={{ base: "none", lg: "inline-flex" }}
					/>
					<Box as={RouterLink} to="/settings" aria-label="Réglages" display={{ base: "block", lg: "none" }} p={1}>
						<Avatar name={me?.username ?? "?"} seed={myId} src={me?.avatar_url} size={36} />
					</Box>
				</Flex>
				<InputGroup mt={3}>
					<InputLeftElement h="44px" color="#9A9189" pointerEvents="none">
						<IconSearch size={18} />
					</InputLeftElement>
					<VisuallyHidden as="label" htmlFor="room-search">
						Rechercher une discussion
					</VisuallyHidden>
					<Input
						id="room-search"
						type="search"
						h="44px"
						bg="cm.raised"
						borderColor="transparent"
						borderRadius="12px"
						placeholder="Rechercher"
						value={search}
						onChange={(e) => setSearch(e.target.value)}
					/>
				</InputGroup>
				<Flex role="group" aria-label="Filtres" gap={2} mt={3} wrap="wrap">
					{chips.map((c) => (
						<Button
							key={c.id}
							size="sm"
							h="34px"
							borderRadius="17px"
							fontWeight={filter === c.id ? 700 : 500}
							variant={filter === c.id ? "primary" : "secondary"}
							aria-pressed={filter === c.id}
							onClick={() => setFilter(c.id)}
						>
							{c.label}
						</Button>
					))}
				</Flex>
			</Box>

			<Box flex={1} minH={0} overflowY="auto" px={2} pb={24}>
				{isPending &&
					Array.from({ length: 6 }, (_, i) => (
						<Flex key={i} gap={3} align="center" px={3} py={3}>
							<Skeleton w="50px" h="50px" borderRadius="full" startColor="cm.raised" endColor="cm.line" />
							<Box flex={1}>
								<Skeleton h="14px" w="45%" mb={2} startColor="cm.raised" endColor="cm.line" />
								<Skeleton h="12px" w="75%" startColor="cm.raised" endColor="cm.line" />
							</Box>
						</Flex>
					))}
				{isError && (
					<Flex direction="column" gap={3} p={4}>
						<InlineAlert status="error">Impossible de charger tes discussions.</InlineAlert>
						<Button size="md" onClick={() => refetch()}>
							Réessayer
						</Button>
					</Flex>
				)}
				{rooms && visible.length === 0 && (
					<Text p={4} color="cm.muted" textAlign="center">
						{rooms.length === 0
							? "Aucune discussion pour l'instant. Lance-en une !"
							: "Aucune discussion ne correspond."}
					</Text>
				)}
				{visible.map((room) => (
					<RoomRow key={room.room_id} room={room} myId={myId} />
				))}
			</Box>

			<IconButton
				as={RouterLink}
				to="/new"
				aria-label="Nouvelle discussion"
				icon={<IconCompose size={24} />}
				variant="primary"
				position="absolute"
				right="18px"
				bottom="max(24px, env(safe-area-inset-bottom))"
				w="58px"
				h="58px"
				borderRadius="18px"
				boxShadow="0 8px 20px rgba(0,0,0,0.45)"
				display={{ base: "inline-flex", lg: "none" }}
			/>
		</Flex>
	);
}
