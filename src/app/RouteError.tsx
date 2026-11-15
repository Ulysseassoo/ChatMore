import { Button, Flex, Heading, Image, Text } from "@chakra-ui/react";
import { useEffect } from "react";
import { Link as RouterLink, isRouteErrorResponse, useRouteError } from "react-router-dom";
import logo from "@/assets/Logo.png";

export function RouteError() {
	const error = useRouteError();
	// Après une mise en ligne, l'ancienne version de l'app ne trouve plus ses fichiers.
	const staleBundle =
		error instanceof Error && /dynamically imported module|Importing a module script failed/i.test(error.message);

	useEffect(() => {
		console.error(error);
	}, [error]);

	const title =
		isRouteErrorResponse(error) && error.status === 404 ? "Page introuvable" : "Quelque chose s'est mal passé";
	const description = staleBundle
		? "Une nouvelle version de ChatMore est disponible. Recharge la page pour la charger."
		: "Tes messages sont en sécurité. Recharge la page ; si le problème continue, reviens aux discussions.";

	return (
		<Flex
			role="alert"
			h="full"
			minH="60dvh"
			direction="column"
			align="center"
			justify="center"
			gap={4}
			px={8}
			textAlign="center"
		>
			<Flex w="120px" h="120px" borderRadius="full" bg="cm.disc" align="center" justify="center">
				<Image src={logo} alt="" w="84px" />
			</Flex>
			<Heading as="h1" fontSize="24px" fontWeight={700}>
				{title}
			</Heading>
			<Text maxW="420px" color="cm.muted" lineHeight={1.6}>
				{description}
			</Text>
			<Flex gap={2.5} wrap="wrap" justify="center" mt={2}>
				<Button variant="primary" onClick={() => window.location.reload()}>
					Recharger
				</Button>
				<Button as={RouterLink} to="/" reloadDocument>
					Retour aux discussions
				</Button>
			</Flex>
		</Flex>
	);
}
