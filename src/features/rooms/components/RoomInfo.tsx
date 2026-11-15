import { Badge, Box, Button, Flex, Heading, IconButton, Input, Menu, MenuButton, MenuItem, MenuList, Switch, Text, useToast } from "@chakra-ui/react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Link as RouterLink, useNavigate, useParams } from "react-router-dom";
import { Avatar } from "@/components/Avatar";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { IconAddUser, IconBlock, IconClose, IconLogout, IconMore, IconMuted } from "@/components/icons";
import { useRequiredUserId } from "@/features/auth/session";
import { blockUser, unblockUser } from "@/features/profile/api";
import { blocksKey, useProfile } from "@/features/profile/hooks";
import { useDebouncedValue } from "@/lib/useDebouncedValue";
import type { Room } from "@/lib/types";
import { addMembers, leaveRoom, removeMember, searchProfiles, setMemberRole, setRoomMuted } from "../api";
import { roomMembersKey, roomsKey, useRoom, useRoomMembers } from "../hooks";
import { getRoomDisplay } from "../roomDisplay";

function PanelHeader({ title }: { title: string }) {
	return (
		<Flex align="center" h="68px" pl={5} pr={2} borderBottom="1px solid" borderColor="cm.line" position="sticky" top={0} bg="cm.surface" zIndex={1}>
			<Heading as="h2" flex={1} fontSize="16px" fontWeight={700}>
				{title}
			</Heading>
			<IconButton as={RouterLink} to=".." relative="path" aria-label="Fermer" icon={<IconClose size={18} />} variant="ghost" />
		</Flex>
	);
}

function MuteRow({ room }: { room: Room }) {
	const myId = useRequiredUserId();
	const qc = useQueryClient();
	return (
		<Flex as="label" align="center" gap={3} minH="52px" px={2} cursor="pointer">
			<IconMuted size={20} aria-hidden="true" />
			<Text flex={1}>Couper les notifications</Text>
			<Switch
				colorScheme="yellow"
				isChecked={room.muted}
				onChange={async (e) => {
					await setRoomMuted(room.room_id, myId, e.target.checked).catch(() => undefined);
					void qc.invalidateQueries({ queryKey: roomsKey });
				}}
			/>
		</Flex>
	);
}

function ContactInfo({ room }: { room: Room }) {
	const myId = useRequiredUserId();
	const display = getRoomDisplay(room);
	const { data: profile } = useProfile(display.peerId);
	const qc = useQueryClient();
	const toast = useToast();
	const [confirming, setConfirming] = useState(false);

	const refresh = () => {
		void qc.invalidateQueries({ queryKey: roomsKey });
		void qc.invalidateQueries({ queryKey: blocksKey });
	};

	return (
		<Box>
			<PanelHeader title="Profil" />
			<Flex direction="column" align="center" gap={1} px={5} pt={7} pb={5} textAlign="center">
				<Avatar name={display.title} seed={display.seed} src={display.avatarUrl} size={112} />
				<Text mt={3} fontSize="20px" fontWeight={700}>
					{display.title}
				</Text>
				<Text color="cm.subtle">@{display.title}</Text>
			</Flex>
			{profile?.about && (
				<Box px={5} py={4} borderTop="1px solid" borderColor="cm.line">
					<Text fontSize="sm" color="cm.subtle" mb={1}>
						Bio
					</Text>
					<Text lineHeight={1.5}>{profile.about}</Text>
				</Box>
			)}
			{profile?.phone && (
				<Box px={5} py={4} borderTop="1px solid" borderColor="cm.line">
					<Text fontSize="sm" color="cm.subtle" mb={1}>
						Téléphone
					</Text>
					<Text>{profile.phone}</Text>
				</Box>
			)}
			<Box px={3} py={2} borderTop="1px solid" borderColor="cm.line">
				<MuteRow room={room} />
				{room.i_blocked_peer ? (
					<Button
						variant="ghost"
						w="full"
						justifyContent="flex-start"
						leftIcon={<IconBlock size={20} />}
						onClick={async () => {
							await unblockUser(myId, display.peerId!).catch(() => toast({ title: "Le déblocage a échoué.", status: "error" }));
							refresh();
						}}
					>
						Débloquer {display.title}
					</Button>
				) : (
					<Button variant="dangerGhost" w="full" justifyContent="flex-start" leftIcon={<IconBlock size={20} />} onClick={() => setConfirming(true)}>
						Bloquer {display.title}
					</Button>
				)}
			</Box>

			<ConfirmDialog
				isOpen={confirming}
				icon={<IconBlock size={24} />}
				title={`Bloquer ${display.title} ?`}
				description={
					<Box as="ul" pl={5}>
						<li>Tu ne recevras plus ses messages.</li>
						<li>Cette personne ne verra plus quand tu es en ligne.</li>
						<li>Elle ne sera pas prévenue.</li>
						<li>Tu pourras la débloquer à tout moment.</li>
					</Box>
				}
				confirmLabel="Bloquer"
				onClose={() => setConfirming(false)}
				onConfirm={async () => {
					setConfirming(false);
					await blockUser(display.peerId!).catch(() => toast({ title: "Le blocage a échoué.", status: "error" }));
					refresh();
				}}
			/>
		</Box>
	);
}

function AddMembers({ roomId, existing }: { roomId: number; existing: string[] }) {
	const [query, setQuery] = useState("");
	const debounced = useDebouncedValue(query.trim(), 250);
	const qc = useQueryClient();
	const { data = [] } = useQuery({ queryKey: ["users", "search", debounced], queryFn: () => searchProfiles(debounced), enabled: debounced.length >= 2 });
	return (
		<Box px={5} pb={4}>
			<Input h="44px" bg="cm.raised" placeholder="Nom d'utilisateur" aria-label="Rechercher un membre à ajouter" value={query} onChange={(e) => setQuery(e.target.value)} autoFocus autoCapitalize="none" />
			{data
				.filter((p) => !existing.includes(p.id))
				.map((p) => (
					<Flex key={p.id} align="center" gap={3} minH="52px">
						<Avatar name={p.username} seed={p.id} src={p.avatar_url} size={36} />
						<Text flex={1}>@{p.username}</Text>
						<Button
							size="sm"
							onClick={async () => {
								await addMembers(roomId, [p.id]);
								void qc.invalidateQueries({ queryKey: roomMembersKey(roomId) });
							}}
						>
							Ajouter
						</Button>
					</Flex>
				))}
		</Box>
	);
}

function GroupInfo({ room }: { room: Room }) {
	const myId = useRequiredUserId();
	const display = getRoomDisplay(room);
	const { data: members = [] } = useRoomMembers(room.room_id);
	const qc = useQueryClient();
	const navigate = useNavigate();
	const toast = useToast();
	const [adding, setAdding] = useState(false);
	const [leaving, setLeaving] = useState(false);
	const iAmAdmin = members.some((m) => m.user_id === myId && m.role === "admin");

	const act = async (action: () => Promise<void>, error: string) => {
		try {
			await action();
			void qc.invalidateQueries({ queryKey: roomMembersKey(room.room_id) });
		} catch {
			toast({ title: error, status: "error", position: "bottom" });
		}
	};

	return (
		<Box>
			<PanelHeader title="Infos du groupe" />
			<Flex direction="column" align="center" gap={1} px={5} pt={7} pb={5} textAlign="center">
				<Avatar name={display.title} seed={display.seed} src={display.avatarUrl} size={96} square />
				<Text mt={3} fontSize="21px" fontWeight={700}>
					{display.title}
				</Text>
				<Text color="cm.subtle" fontSize="sm">
					Groupe · {members.length} membre{members.length > 1 ? "s" : ""}
				</Text>
			</Flex>

			<Box px={3} pb={2}>
				<MuteRow room={room} />
			</Box>

			<Flex align="center" justify="space-between" px={5} pt={3} pb={1} borderTop="1px solid" borderColor="cm.line">
				<Heading as="h3" fontSize="13px" fontWeight={600} color="cm.muted" textTransform="uppercase" letterSpacing="0.6px">
					{members.length} membres
				</Heading>
				{iAmAdmin && (
					<Button size="sm" variant="ghost" color="cm.amberText" leftIcon={<IconAddUser size={16} />} onClick={() => setAdding((a) => !a)} aria-expanded={adding}>
						Ajouter
					</Button>
				)}
			</Flex>
			{adding && <AddMembers roomId={room.room_id} existing={members.map((m) => m.user_id)} />}
			<Box px={5} pb={3}>
				{members.map((m) => (
					<Flex key={m.user_id} align="center" gap={3} minH="58px">
						<Avatar name={m.username} seed={m.user_id} src={m.avatar_url} size={42} />
						<Box flex={1} minW={0}>
							<Text fontWeight={600} noOfLines={1}>
								{m.user_id === myId ? "Vous" : m.username}
							</Text>
							<Text fontSize="13px" color="cm.subtle">
								@{m.username}
							</Text>
						</Box>
						{m.role === "admin" && (
							<Badge bg="cm.amberTint" color="cm.amberText" borderRadius="8px" px={2} py={0.5} textTransform="none">
								Admin
							</Badge>
						)}
						{iAmAdmin && m.user_id !== myId && (
							<Menu placement="bottom-end" isLazy>
								<MenuButton as={IconButton} aria-label={`Options pour ${m.username}`} icon={<IconMore size={18} />} variant="ghost" size="sm" />
								<MenuList>
									<MenuItem onClick={() => act(() => setMemberRole(room.room_id, m.user_id, m.role === "admin" ? "member" : "admin"), "Le rôle n'a pas pu être modifié.")}>
										{m.role === "admin" ? "Retirer le rôle d'admin" : "Nommer admin"}
									</MenuItem>
									<MenuItem color="cm.danger" onClick={() => act(() => removeMember(room.room_id, m.user_id), "Le membre n'a pas pu être retiré.")}>
										Retirer du groupe
									</MenuItem>
								</MenuList>
							</Menu>
						)}
					</Flex>
				))}
			</Box>

			<Box px={3} py={2} borderTop="1px solid" borderColor="cm.line">
				<Button variant="dangerGhost" w="full" justifyContent="flex-start" leftIcon={<IconLogout size={20} />} onClick={() => setLeaving(true)}>
					Quitter le groupe
				</Button>
			</Box>

			<ConfirmDialog
				isOpen={leaving}
				icon={<IconLogout size={24} />}
				title={`Quitter « ${display.title} » ?`}
				description={iAmAdmin && members.filter((m) => m.role === "admin").length === 1 ? "Tu es le seul admin : le membre le plus ancien le deviendra." : "Tu ne recevras plus les messages de ce groupe."}
				confirmLabel="Quitter"
				onClose={() => setLeaving(false)}
				onConfirm={async () => {
					setLeaving(false);
					try {
						await leaveRoom(room.room_id);
						await qc.invalidateQueries({ queryKey: roomsKey });
						navigate("/", { replace: true });
					} catch {
						toast({ title: "Impossible de quitter le groupe.", status: "error" });
					}
				}}
			/>
		</Box>
	);
}

/** Panneau d'infos d'une conversation : profil du contact ou infos du groupe. */
export function RoomInfo() {
	const { data: room } = useRoom(Number(useParams().roomId));
	if (!room) return null;
	return room.type === "group" ? <GroupInfo room={room} /> : <ContactInfo room={room} />;
}
