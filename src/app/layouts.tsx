import { Box, Flex, IconButton, Image, Tooltip } from "@chakra-ui/react";
import { useEffect } from "react";
import { Navigate, NavLink, Outlet, useLocation, useMatch, useNavigate } from "react-router-dom";
import { Avatar } from "@/components/Avatar";
import { FullPageSpinner } from "@/components/FullPageSpinner";
import { IconBack, IconChats, IconSettings } from "@/components/icons";
import logo from "@/assets/Logo.png";
import { useAuth, useRequiredUserId } from "@/features/auth/session";
import { useMyProfile } from "@/features/profile/hooks";
import { RealtimeSubscriptions } from "@/features/realtime/RealtimeSubscriptions";
import { RoomList } from "@/features/rooms/components/RoomList";
import { OfflineBanner } from "./OfflineBanner";

/** Pages publiques : si on est déjà connecté, on file vers l'app (ou la page demandée avant). */
export function PublicLayout() {
	const auth = useAuth();
	const location = useLocation();
	if (auth.status === "loading") return <FullPageSpinner />;
	if (auth.status === "signedIn") {
		const from = (location.state as { from?: string } | null)?.from;
		return <Navigate to={from ?? "/"} replace />;
	}
	return <Outlet />;
}

/** Zone connectée : seul endroit qui décide d'une redirection vers /login. */
export function ProtectedLayout() {
	const auth = useAuth();
	const location = useLocation();
	if (auth.status === "loading") return <FullPageSpinner />;
	if (auth.status === "signedOut") {
		return <Navigate to="/login" replace state={{ from: location.pathname + location.search }} />;
	}
	return (
		<>
			<RealtimeSubscriptions />
			<Outlet />
		</>
	);
}

function RailLink({ to, label, icon, end }: { to: string; label: string; icon: React.ReactNode; end?: boolean }) {
	return (
		<Tooltip label={label} placement="right" openDelay={400}>
			<Box as={NavLink} to={to} end={end} aria-label={label} display="block" borderRadius="14px">
				{({ isActive }: { isActive: boolean }) => (
					<Flex
						w="48px"
						h="48px"
						borderRadius="14px"
						align="center"
						justify="center"
						bg={isActive ? "cm.amberTint" : "transparent"}
						color={isActive ? "cm.amberText" : "cm.muted"}
						_hover={{ bg: isActive ? "cm.amberTint" : "cm.raised" }}
					>
						{icon}
					</Flex>
				)}
			</Box>
		</Tooltip>
	);
}

/**
 * Coque de l'app : rail, liste des discussions, contenu.
 * Sur mobile, une seule vue à la fois : la liste sur « / », sinon le contenu.
 */
export function AppShell() {
	const myId = useRequiredUserId();
	const { data: me } = useMyProfile();
	const atHome = useMatch("/") !== null;
	const inSettings = useMatch("/settings/*") !== null;
	const navigate = useNavigate();

	// Ctrl + K (ou Cmd + K) : rechercher une discussion.
	useEffect(() => {
		const onKey = (e: KeyboardEvent) => {
			if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
				e.preventDefault();
				if (inSettings) navigate("/");
				setTimeout(() => document.getElementById("room-search")?.focus(), 0);
			}
		};
		window.addEventListener("keydown", onKey);
		return () => window.removeEventListener("keydown", onKey);
	}, [inSettings, navigate]);

	return (
		<Flex h="100dvh" bg="cm.bg" overflow="hidden" direction="column">
			<OfflineBanner />
			<Flex flex={1} minH={0}>
				<Flex
					as="nav"
					aria-label="Navigation principale"
					direction="column"
					align="center"
					gap={2}
					py={4}
					w="72px"
					flexShrink={0}
					borderRight="1px solid"
					borderColor="cm.line"
					display={{ base: "none", lg: "flex" }}
				>
					<Image src={logo} alt="ChatMore" w="40px" mb={4} />
					<RailLink to="/" end={false} label="Discussions" icon={<IconChats size={22} />} />
					<RailLink to="/settings" label="Réglages" icon={<IconSettings size={22} />} />
					<Box flex={1} />
					<Box as={NavLink} to="/settings" aria-label="Mon profil" borderRadius="full">
						<Avatar name={me?.username ?? "?"} seed={myId} src={me?.avatar_url} size={40} />
					</Box>
				</Flex>

				<Box
					as="aside"
					aria-label="Liste des discussions"
					w={{ base: "full", lg: "380px" }}
					flexShrink={0}
					bg="cm.surface"
					borderRight="1px solid"
					borderColor="cm.line"
					display={{ base: atHome ? "block" : "none", lg: inSettings ? "none" : "block" }}
				>
					<RoomList />
				</Box>

				<Box flex={1} minW={0} display={{ base: atHome ? "none" : "block", lg: "block" }} bg="cm.chat">
					<Outlet />
				</Box>
			</Flex>
		</Flex>
	);
}

export function MobileBackButton({ to = "/", label = "Retour aux discussions" }: { to?: string; label?: string }) {
	return (
		<IconButton
			as={NavLink}
			to={to}
			aria-label={label}
			variant="ghost"
			icon={<IconBack size={22} />}
			display={{ base: "inline-flex", lg: "none" }}
		/>
	);
}
