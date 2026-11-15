import { Flex, Spinner } from "@chakra-ui/react";

export function FullPageSpinner() {
	return (
		<Flex h="100dvh" align="center" justify="center" bg="cm.bg" role="status" aria-label="Chargement">
			<Spinner color="cm.amber" thickness="3px" size="lg" />
		</Flex>
	);
}
