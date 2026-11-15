import { Box, Button, Flex, Heading, Text, useToast } from "@chakra-ui/react";
import { useQueryClient } from "@tanstack/react-query";
import { MobileBackButton } from "@/app/layouts";
import { Avatar } from "@/components/Avatar";
import { useRequiredUserId } from "@/features/auth/session";
import { blockUser, unblockUser } from "@/features/profile/api";
import { blocksKey, useBlocks } from "@/features/profile/hooks";
import { roomsKey } from "@/features/rooms/hooks";

const date = new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "long" });

export function BlockedUsersPage() {
	const myId = useRequiredUserId();
	const { data: blocks = [], isPending } = useBlocks();
	const qc = useQueryClient();
	const toast = useToast();

	const refresh = () => {
		void qc.invalidateQueries({ queryKey: blocksKey });
		void qc.invalidateQueries({ queryKey: roomsKey });
	};

	const unblock = async (userId: string, username: string) => {
		try {
			await unblockUser(myId, userId);
			refresh();
			toast({
				position: "bottom",
				duration: 5000,
				render: (toastProps) => (
					<Flex
						role="status"
						align="center"
						gap={3}
						p={3}
						pl={4}
						borderRadius="14px"
						bg="cm.text"
						color="cm.amberInk"
						boxShadow="0 10px 30px rgba(0,0,0,0.5)"
					>
						<Text flex={1}>{username} a été débloqué.</Text>
						<Button
							size="sm"
							variant="ghost"
							color="#7A560E"
							_hover={{ bg: "rgba(0,0,0,0.06)" }}
							onClick={async () => {
								toastProps.onClose();
								await blockUser(userId).catch(() => undefined);
								refresh();
							}}
						>
							Annuler
						</Button>
					</Flex>
				),
			});
		} catch {
			toast({ title: "Le déblocage a échoué.", status: "error", position: "bottom" });
		}
	};

	return (
		<Box h="full" overflowY="auto">
			<Box
				maxW="680px"
				mx="auto"
				px={{ base: 4, lg: 8 }}
				pt={{ base: "max(12px, env(safe-area-inset-top))", lg: 10 }}
				pb={16}
			>
				<Flex align="center" gap={1} mb={3} ml={-2}>
					<MobileBackButton to="/settings" label="Retour aux réglages" />
					<Heading as="h1" fontSize={{ base: "20px", lg: "24px" }} fontWeight={800}>
						Utilisateurs bloqués
					</Heading>
				</Flex>
				<Text color="cm.muted" fontSize="sm" lineHeight={1.6} mb={5}>
					Ces personnes ne peuvent plus t'envoyer de messages ni voir quand tu es en ligne. Elles ne sont pas prévenues.
					Le blocage ne s'applique pas dans les groupes.
				</Text>
				{!isPending && blocks.length === 0 && <Text color="cm.subtle">Tu n'as bloqué personne.</Text>}
				{blocks.length > 0 && (
					<Box borderRadius="16px" bg="cm.surface" border="1px solid" borderColor="cm.line">
						{blocks.map((b) => (
							<Flex
								key={b.blocked_id}
								align="center"
								gap={3}
								minH="68px"
								px={4}
								borderTop="1px solid"
								borderColor="cm.line"
								_first={{ borderTop: "none" }}
							>
								<Avatar name={b.profile?.username ?? "?"} seed={b.blocked_id} src={b.profile?.avatar_url} size={44} />
								<Box flex={1} minW={0}>
									<Text fontWeight={600}>@{b.profile?.username}</Text>
									<Text fontSize="13px" color="cm.subtle">
										Bloqué le {date.format(new Date(b.created_at))}
									</Text>
								</Box>
								<Button
									size="sm"
									h="38px"
									onClick={() => unblock(b.blocked_id, b.profile?.username ?? "Cette personne")}
								>
									Débloquer
								</Button>
							</Flex>
						))}
					</Box>
				)}
			</Box>
		</Box>
	);
}
