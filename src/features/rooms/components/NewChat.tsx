import {
	Box,
	Flex,
	Heading,
	Input,
	InputGroup,
	InputLeftElement,
	Spinner,
	Text,
	VisuallyHidden,
	useToast,
} from "@chakra-ui/react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Link as RouterLink, useNavigate, useSearchParams } from "react-router-dom";
import { MobileBackButton } from "@/app/layouts";
import { Avatar } from "@/components/Avatar";
import { IconAddUser, IconSearch } from "@/components/icons";
import { useDebouncedValue } from "@/lib/useDebouncedValue";
import type { ProfileSearchResult } from "@/lib/types";
import { getOrCreateDirectRoom, searchProfiles } from "../api";
import { roomsKey } from "../hooks";

function Highlight({ text, query }: { text: string; query: string }) {
	const fold = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
	const i = fold(text).indexOf(fold(query));
	if (!query || i < 0) return <>{text}</>;
	return (
		<>
			{text.slice(0, i)}
			<Box as="mark" bg="transparent" color="cm.amberText" fontWeight={700}>
				{text.slice(i, i + query.length)}
			</Box>
			{text.slice(i + query.length)}
		</>
	);
}

export function NewChat() {
	const [params, setParams] = useSearchParams();
	const q = params.get("q") ?? "";
	const debounced = useDebouncedValue(q.trim(), 250);
	const navigate = useNavigate();
	const qc = useQueryClient();
	const toast = useToast();
	const [opening, setOpening] = useState<string | null>(null);

	const { data, isFetching } = useQuery({
		queryKey: ["users", "search", debounced],
		queryFn: () => searchProfiles(debounced),
		enabled: debounced.length >= 2,
		staleTime: 60_000,
	});

	const open = async (person: ProfileSearchResult) => {
		if (person.direct_room_id) return navigate(`/chat/${person.direct_room_id}`);
		setOpening(person.id);
		try {
			const roomId = await getOrCreateDirectRoom(person.id);
			await qc.invalidateQueries({ queryKey: roomsKey });
			navigate(`/chat/${roomId}`, { replace: true });
		} catch {
			toast({ title: "Impossible d'ouvrir la discussion.", status: "error", position: "bottom" });
			setOpening(null);
		}
	};

	return (
		<Flex direction="column" h="full" maxW="640px" mx="auto" w="full">
			<Flex align="center" gap={1} px={2} pt={{ base: "max(12px, env(safe-area-inset-top))", lg: 6 }} pb={2}>
				<MobileBackButton />
				<Heading as="h1" fontSize={{ base: "19px", lg: "22px" }} fontWeight={700} px={{ lg: 4 }}>
					Nouvelle discussion
				</Heading>
			</Flex>
			<Box px={4} pb={3}>
				<InputGroup>
					<InputLeftElement h="50px" color="cm.muted" pointerEvents="none">
						<IconSearch size={18} />
					</InputLeftElement>
					<VisuallyHidden as="label" htmlFor="user-search">
						Rechercher un nom d'utilisateur
					</VisuallyHidden>
					<Input
						id="user-search"
						type="search"
						autoFocus
						autoCapitalize="none"
						pl="42px"
						bg="cm.raised"
						placeholder="Nom d'utilisateur"
						value={q}
						onChange={(e) => setParams(e.target.value ? { q: e.target.value } : {}, { replace: true })}
					/>
				</InputGroup>
			</Box>

			<Box flex={1} overflowY="auto" px={2}>
				<Flex
					as={RouterLink}
					to="/new/group"
					align="center"
					gap={3.5}
					minH="64px"
					px={3}
					borderRadius="14px"
					_hover={{ bg: "cm.raised" }}
				>
					<Flex w="44px" h="44px" borderRadius="full" bg="cm.amber" color="cm.amberInk" align="center" justify="center">
						<IconAddUser size={22} />
					</Flex>
					<Text fontWeight={600}>Nouveau groupe</Text>
				</Flex>

				{debounced.length >= 2 && (
					<Flex align="center" gap={2} mx={3} mt={4} mb={1.5}>
						<Heading
							as="h2"
							fontSize="13px"
							fontWeight={600}
							color="cm.muted"
							textTransform="uppercase"
							letterSpacing="0.6px"
						>
							Résultats pour « {debounced} »
						</Heading>
						{isFetching && <Spinner size="xs" color="cm.amber" />}
					</Flex>
				)}

				<Box aria-live="polite">
					{data?.map((person) => (
						<Flex
							as="button"
							key={person.id}
							w="full"
							textAlign="left"
							align="center"
							gap={3.5}
							minH="68px"
							px={3}
							borderRadius="14px"
							_hover={{ bg: "cm.raised" }}
							onClick={() => void open(person)}
							disabled={opening !== null}
						>
							<Avatar name={person.username} seed={person.id} src={person.avatar_url} size={44} />
							<Text flex={1} fontWeight={600}>
								@<Highlight text={person.username} query={debounced} />
							</Text>
							{opening === person.id ? (
								<Spinner size="sm" color="cm.amber" />
							) : (
								<Text fontSize="sm" fontWeight={600} color={person.direct_room_id ? "cm.muted" : "cm.amberText"}>
									{person.direct_room_id ? "Ouvrir" : "Écrire"}
								</Text>
							)}
						</Flex>
					))}
					{data?.length === 0 && (
						<Text px={3} py={4} color="cm.muted">
							Personne ne correspond à « {debounced} ».
						</Text>
					)}
				</Box>
				<Text px={3} mt={4} fontSize="sm" color="#9A9189" lineHeight={1.5}>
					La recherche porte sur les noms d'utilisateur (2 caractères minimum).
				</Text>
			</Box>
		</Flex>
	);
}
