import {
	Box,
	Button,
	Checkbox,
	Flex,
	FormControl,
	FormLabel,
	Heading,
	IconButton,
	Input,
	InputGroup,
	InputLeftElement,
	Text,
	VisuallyHidden,
	useToast,
} from "@chakra-ui/react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { MobileBackButton } from "@/app/layouts";
import { Avatar } from "@/components/Avatar";
import { IconClose, IconSearch } from "@/components/icons";
import { useDebouncedValue } from "@/lib/useDebouncedValue";
import type { ProfileSearchResult } from "@/lib/types";
import { createGroup, searchProfiles } from "../api";
import { roomsKey } from "../hooks";

export function NewGroup() {
	const [name, setName] = useState("");
	const [query, setQuery] = useState("");
	const [selected, setSelected] = useState<ProfileSearchResult[]>([]);
	const [creating, setCreating] = useState(false);
	const debounced = useDebouncedValue(query.trim(), 250);
	const navigate = useNavigate();
	const qc = useQueryClient();
	const toast = useToast();

	const { data: results = [] } = useQuery({
		queryKey: ["users", "search", debounced],
		queryFn: () => searchProfiles(debounced),
		enabled: debounced.length >= 2,
	});

	const toggle = (person: ProfileSearchResult) =>
		setSelected((s) => (s.some((p) => p.id === person.id) ? s.filter((p) => p.id !== person.id) : [...s, person]));

	const create = async () => {
		setCreating(true);
		try {
			const roomId = await createGroup(
				name.trim(),
				selected.map((p) => p.id),
			);
			await qc.invalidateQueries({ queryKey: roomsKey });
			navigate(`/chat/${roomId}`, { replace: true });
		} catch {
			toast({ title: "Le groupe n'a pas pu être créé.", status: "error", position: "bottom" });
			setCreating(false);
		}
	};

	const list = [...selected, ...results.filter((r) => !selected.some((s) => s.id === r.id))];

	return (
		<Flex direction="column" h="full" maxW="640px" mx="auto" w="full">
			<Flex align="center" gap={1} px={2} pt={{ base: "max(12px, env(safe-area-inset-top))", lg: 6 }} pb={2}>
				<MobileBackButton to="/new" label="Retour" />
				<Heading as="h1" fontSize={{ base: "19px", lg: "22px" }} fontWeight={700} px={{ lg: 4 }}>
					Nouveau groupe
				</Heading>
			</Flex>

			<Box px={4} pb={4} borderBottom="1px solid" borderColor="cm.line">
				<FormControl>
					<FormLabel>Nom du groupe</FormLabel>
					<Input
						maxLength={40}
						value={name}
						onChange={(e) => setName(e.target.value)}
						placeholder="Ex. Anniv' surprise de Nadia"
					/>
				</FormControl>
			</Box>

			<Box px={4} pt={3}>
				<Text fontSize="sm" fontWeight={600} color="cm.muted" mb={2}>
					Membres · {selected.length} sélectionné{selected.length > 1 ? "s" : ""}
				</Text>
				<Flex gap={2} wrap="wrap">
					{selected.map((p) => (
						<Flex key={p.id} align="center" gap={1.5} h="36px" pl={1} pr={1} borderRadius="18px" bg="cm.raised">
							<Avatar name={p.username} seed={p.id} src={p.avatar_url} size={28} />
							<Text fontSize="sm">{p.username}</Text>
							<IconButton
								aria-label={`Retirer ${p.username}`}
								icon={<IconClose size={13} />}
								variant="ghost"
								size="xs"
								minW="28px"
								h="28px"
								borderRadius="full"
								onClick={() => toggle(p)}
							/>
						</Flex>
					))}
				</Flex>
				<InputGroup mt={3}>
					<InputLeftElement h="44px" color="cm.muted" pointerEvents="none">
						<IconSearch size={18} />
					</InputLeftElement>
					<VisuallyHidden as="label" htmlFor="member-search">
						Ajouter des membres
					</VisuallyHidden>
					<Input
						id="member-search"
						type="search"
						h="44px"
						pl="40px"
						bg="cm.raised"
						placeholder="Ajouter des membres"
						value={query}
						onChange={(e) => setQuery(e.target.value)}
						autoCapitalize="none"
					/>
				</InputGroup>
			</Box>

			<Box flex={1} overflowY="auto" px={2} py={2}>
				{list.map((p) => (
					<Flex
						as="label"
						key={p.id}
						align="center"
						gap={3.5}
						minH="60px"
						px={3}
						borderRadius="14px"
						cursor="pointer"
						_hover={{ bg: "cm.raised" }}
					>
						<Avatar name={p.username} seed={p.id} src={p.avatar_url} size={44} />
						<Text flex={1} fontWeight={600}>
							@{p.username}
						</Text>
						<Checkbox size="lg" isChecked={selected.some((s) => s.id === p.id)} onChange={() => toggle(p)} />
					</Flex>
				))}
			</Box>

			<Box
				px={4}
				pt={3}
				pb={{ base: "max(16px, env(safe-area-inset-bottom))", lg: 6 }}
				borderTop="1px solid"
				borderColor="cm.line"
			>
				<Button variant="primary" size="lg" w="full" isDisabled={!name.trim()} isLoading={creating} onClick={create}>
					Créer le groupe
				</Button>
				<Text mt={2} textAlign="center" fontSize="sm" color="cm.subtle">
					Tu seras administrateur. Les membres ne verront que les messages envoyés après leur arrivée.
				</Text>
			</Box>
		</Flex>
	);
}
