import { Box, Button, Flex, Heading, Link, Text } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { Link as RouterLink, Navigate, useLocation } from "react-router-dom";
import { LuCheck, LuMail } from "react-icons/lu";
import { InlineAlert } from "@/components/InlineAlert";
import { authErrorMessage, resendConfirmation } from "../api";
import { AuthCard, AuthScene } from "./AuthScene";

const COOLDOWN = 60;

export function CheckEmailPage() {
	const email = (useLocation().state as { email?: string } | null)?.email;
	const [remaining, setRemaining] = useState(COOLDOWN);
	const [feedback, setFeedback] = useState<{ status: "error" | "success"; text: string } | null>(null);
	const [sending, setSending] = useState(false);

	useEffect(() => {
		if (remaining <= 0) return;
		const timer = setTimeout(() => setRemaining((r) => r - 1), 1000);
		return () => clearTimeout(timer);
	}, [remaining]);

	if (!email) return <Navigate to="/register" replace />;

	const resend = async () => {
		setSending(true);
		setFeedback(null);
		try {
			await resendConfirmation(email);
			setFeedback({ status: "success", text: "E-mail renvoyé." });
			setRemaining(COOLDOWN);
		} catch (e) {
			setFeedback({ status: "error", text: authErrorMessage(e) });
		} finally {
			setSending(false);
		}
	};

	return (
		<AuthScene>
			<AuthCard alignItems="center" textAlign="center">
				<Box position="relative" w="160px" h="160px" borderRadius="full" bg="cm.disc" display="flex" alignItems="center" justifyContent="center">
					<LuMail size={84} color="#1B1610" strokeWidth={1.4} aria-hidden="true" />
					<Flex position="absolute" right="14px" top="18px" w="40px" h="40px" borderRadius="full" bg="cm.amberInk" color="cm.disc" align="center" justify="center">
						<LuCheck size={20} strokeWidth={3} aria-hidden="true" />
					</Flex>
				</Box>
				<Heading as="h1" fontSize="26px" fontWeight={800}>
					Vérifie ta boîte mail
				</Heading>
				<Text color="#C9C0B6" lineHeight={1.6}>
					On a envoyé un lien de confirmation à{" "}
					<Text as="strong" color="cm.text">
						{email}
					</Text>
					. Clique dessus pour activer ton compte.
				</Text>
				<Box w="full" p={4} borderRadius="14px" bg="cm.bg" border="1px solid" borderColor="cm.line" fontSize="sm" color="#C9C0B6" textAlign="left">
					Rien reçu ? Regarde dans les indésirables. Le lien reste valable 24 heures.
				</Box>
				<Button w="full" size="lg" isDisabled={remaining > 0} isLoading={sending} onClick={resend} aria-describedby="resend-help">
					Renvoyer l'e-mail
				</Button>
				<Text id="resend-help" fontSize="sm" color="cm.subtle" minH="20px">
					{remaining > 0 ? `Disponible dans 0:${String(remaining).padStart(2, "0")}` : ""}
				</Text>
				{feedback && <InlineAlert status={feedback.status}>{feedback.text}</InlineAlert>}
				<Flex gap={6} justify="center" wrap="wrap">
					<Link as={RouterLink} to="/register" color="cm.amberText" fontSize="sm" py={1.5}>
						Modifier l'adresse e-mail
					</Link>
					<Link as={RouterLink} to="/login" color="cm.amberText" fontSize="sm" py={1.5}>
						Retour à la connexion
					</Link>
				</Flex>
			</AuthCard>
		</AuthScene>
	);
}
