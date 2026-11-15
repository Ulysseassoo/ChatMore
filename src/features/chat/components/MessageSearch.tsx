import {
	Box,
	Flex,
	Input,
	InputGroup,
	InputLeftElement,
	Spinner,
	Text,
	VisuallyHidden,
	useBreakpointValue,
} from "@chakra-ui/react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { IconSearch } from "@/components/icons";
import { PanelHeader } from "@/components/PanelHeader";
import { useRequiredUserId } from "@/features/auth/session";
import { useRoomMembers } from "@/features/rooms/hooks";
import { formatListTime, formatTime } from "@/lib/dates";
import { useDebouncedValue } from "@/lib/useDebouncedValue";
import { searchMessages } from "../api";

const fold = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

function Excerpt({ text, query }: { text: string; query: string }) {
	const start = fold(text).indexOf(fold(query));
	if (start < 0) return <>{text}</>;
	const from = Math.max(0, start - 40);
	return (
		<>
			{from > 0 && "…"}
			{text.slice(from, start)}
			<Box as="mark" bg="cm.amberTint" color="cm.amberText" borderRadius="4px" px="1px">
				{text.slice(start, start + query.length)}
			</Box>
			{text.slice(start + query.length)}
		</>
	);
}

export function MessageSearch() {
	const roomId = Number(useParams().roomId);
	const myId = useRequiredUserId();
	const { data: members = [] } = useRoomMembers(roomId);
	const [params, setParams] = useSearchParams();
	const q = params.get("q") ?? "";
	const debounced = useDebouncedValue(q.trim(), 250);
	const navigate = useNavigate();
	const fullScreen = useBreakpointValue({ base: true, xl: false }, { ssr: false });

	const { data: results, isFetching } = useQuery({
		queryKey: ["message-search", roomId, debounced],
		queryFn: () => searchMessages(roomId, debounced),
		enabled: debounced.length >= 2,
		staleTime: 10_000,
	});

	const nameOf = (userId: string) =>
		userId === myId ? "Vous" : (members.find((m) => m.user_id === userId)?.username ?? "Membre");

	const open = (messageId: number) => {
		if (fullScreen) navigate(`/chat/${roomId}?m=${messageId}`);
		else setParams({ q, m: String(messageId) }, { replace: true });
	};

	return (
		<Box>
			<PanelHeader title="Rechercher" />
			<Box px={4} py={3}>
				<InputGroup>
					<InputLeftElement h="44px" color="cm.muted" pointerEvents="none">
						<IconSearch size={18} />
					</InputLeftElement>
					<VisuallyHidden as="label" htmlFor="message-search">
						Texte à rechercher
					</VisuallyHidden>
					<Input
						id="message-search"
						type="search"
						autoFocus
						h="44px"
						pl="40px"
						bg="cm.raised"
						placeholder="Rechercher dans la conversation"
						value={q}
						onChange={(e) => setParams(e.target.value ? { q: e.target.value } : {}, { replace: true })}
					/>
				</InputGroup>
			</Box>

			<Box px={2} pb={6} aria-live="polite">
				{isFetching && (
					<Flex justify="center" py={4}>
						<Spinner size="sm" color="cm.amber" />
					</Flex>
				)}
				{results?.length === 0 && (
					<Text px={3} py={2} color="cm.muted">
						Aucun message ne contient « {debounced} ».
					</Text>
				)}
				{results && results.length > 0 && (
					<Text px={3} pb={2} fontSize="sm" color="cm.subtle">
						{results.length} résultat{results.length > 1 ? "s" : ""}
					</Text>
				)}
				{results?.map((r) => (
					<Box
						as="button"
						key={r.id}
						w="full"
						textAlign="left"
						px={3}
						py={2.5}
						borderRadius="12px"
						_hover={{ bg: "cm.raised" }}
						onClick={() => open(r.id)}
					>
						<Flex justify="space-between" gap={2} fontSize="xs" color="cm.subtle" mb={0.5}>
							<Text fontWeight={600} color="cm.textSoft">
								{nameOf(r.user_id)}
							</Text>
							<Text>
								{formatListTime(r.created_at)} · {formatTime(r.created_at)}
							</Text>
						</Flex>
						<Text fontSize="sm" noOfLines={2}>
							<Excerpt text={r.content} query={debounced} />
						</Text>
					</Box>
				))}
				{debounced.length < 2 && (
					<Text px={3} fontSize="sm" color="#9A9189">
						2 caractères minimum. Les accents et les majuscules sont ignorés.
					</Text>
				)}
			</Box>
		</Box>
	);
}
